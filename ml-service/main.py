from fastapi import FastAPI, HTTPException, Security, Depends, BackgroundTasks
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from typing import List, Optional
import os

from utils.preprocessor import clean
from utils.model_loader import get_model, reload_model
import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="UNSAP ML Service", version="2.0")

API_KEY = os.environ.get("ML_API_KEY", "dev-key-123")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

def verify_api_key(key: str = Security(api_key_header)):
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return key

# Models Pydantic
class ClassifyRequest(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    priority: str
    confidence: float
    model_version: Optional[str]
    overridden_by_keyword: bool = False
    keyword_matched: Optional[str] = None

class FaqSuggestRequest(BaseModel):
    text: str
    top_k: Optional[int] = 3

class SentimentRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "UNSAP ML Service v2.0"}

@app.post("/classify", response_model=ClassifyResponse)
def predict_priority(req: ClassifyRequest, api_key: str = Depends(verify_api_key)):
    model, vectorizer, model_version = get_model()
    
    if not model or not vectorizer:
        print("Fallback triggered: Model or Vectorizer not loaded.")
        return ClassifyResponse(
            priority="normal",
            confidence=1.0,
            model_version="fallback"
        )
        
    cleaned_text = clean(req.text)
    print(f"--- Inference ---")
    print(f"Input: {req.text}")
    print(f"Cleaned: {cleaned_text}")
    
    URGENT_KEYWORDS = [
        "krs", "ukt", "uang kuliah", "spp", "beasiswa",
        "kebakaran", "kecelakaan", "darurat",
        "pelecehan", "kekerasan", "bullying", "pencurian", "kehilangan",
        "do", "drop out", "tidak lulus", "wisuda", "ijazah",
        "sakit parah", "keracunan", "pingsan"
    ]
    
    text_lower = req.text.lower()
    matched_keyword = next((kw for kw in URGENT_KEYWORDS if kw in text_lower), None)
    
    if matched_keyword:
        print(f"Keyword match: {matched_keyword} -> priority: urgent")
        return ClassifyResponse(
            priority="urgent",
            confidence=1.0,
            model_version=model_version or "rule_based",
            overridden_by_keyword=True,
            keyword_matched=matched_keyword
        )
        
    # Transform
    vec = vectorizer.transform([cleaned_text])
    
    # Predict
    pred = model.predict(vec)[0]
    
    # Confidence
    confidence = 1.0
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vec)[0]
        confidence = float(max(probs))
        
    print(f"Model prediction: {pred} (confidence: {confidence:.4f})")
    print(f"Model version: {model_version}")
    print(f"-----------------")
        
    return ClassifyResponse(
        priority=pred,
        confidence=confidence,
        model_version=model_version
    )

# --- FAQ Engine ---
def load_faqs():
    faq_path = Path(__file__).parent / "datasets" / "faqs.json"
    if faq_path.exists():
        with open(faq_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

_faqs = None
_faq_vectorizer = None
_faq_matrix = None

def get_faq_index():
    global _faqs, _faq_vectorizer, _faq_matrix
    
    # Simple hot-reload logic or singleton
    # In production, we might want a separate /reload-faqs endpoint
    current_faqs = load_faqs()
    if not current_faqs:
        return [], None, None
        
    # Rebuild if length changed (simple heuristic) or if it's None
    if _faqs is None or len(current_faqs) != len(_faqs):
        _faqs = current_faqs
        _faq_vectorizer = TfidfVectorizer()
        
        # Combine question and answer for vectorization
        corpus = [clean(f['question'] + ' ' + f['answer']) for f in _faqs]
        if corpus:
            _faq_matrix = _faq_vectorizer.fit_transform(corpus)
        else:
            _faq_matrix = None
            
    return _faqs, _faq_vectorizer, _faq_matrix

@app.post("/faq-suggest")
def suggest_faq(req: FaqSuggestRequest, api_key: str = Depends(verify_api_key)):
    faqs, vectorizer, matrix = get_faq_index()
    if not faqs or not vectorizer or matrix is None:
        return {"suggestions": []}
        
    cleaned_query = clean(req.text)
    if not cleaned_query:
        return {"suggestions": []}
        
    query_vec = vectorizer.transform([cleaned_query])
    scores = cosine_similarity(query_vec, matrix).flatten()
    
    # Get top K indices
    top_indices = scores.argsort()[::-1][:req.top_k]
    
    suggestions = []
    for i in top_indices:
        score = float(scores[i])
        if score > 0.15:  # Similarity threshold
            suggestions.append({
                "faq_id": faqs[i].get("id", str(i)),
                "question": faqs[i]["question"],
                "answer": faqs[i]["answer"],
                "score": round(score, 3)
            })
            
    return {"suggestions": suggestions}

POSITIVE_WORDS = ["terima kasih", "bagus", "baik", "puas", "membantu",       
                  "cepat", "profesional", "ramah", "selesai"]
NEGATIVE_WORDS = ["buruk", "lambat", "tidak", "belum", "kecewa", "parah",    
                  "susah", "sulit", "lama", "tidak ada", "tidak bisa"]       

@app.post("/sentiment")
def analyze_sentiment(req: SentimentRequest, api_key: str = Depends(verify_api_key)):
    text_lower = req.text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in text_lower)
    total = pos + neg
    
    if total == 0:
        score = 0.5
        label = "neutral"
    else:
        score = pos / total
        label = "positive" if score > 0.6 else "negative" if score < 0.4 else "neutral"
        
    return {"score": round(score, 3), "label": label}

def background_train_task():
    import subprocess
    try:
        # Execute train.py
        subprocess.run(["python", "train.py"], check=True)
        # Reload model in memory
        reload_model()
        print("Background training completed and model reloaded.")
    except Exception as e:
        print(f"Background training failed: {e}")

@app.post("/retrain")
def trigger_retrain(background_tasks: BackgroundTasks, api_key: str = Depends(verify_api_key)):
    background_tasks.add_task(background_train_task)
    return {"message": "Retraining started in background"}
