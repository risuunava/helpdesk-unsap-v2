from fastapi import FastAPI, HTTPException, Security, Depends, BackgroundTasks
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from typing import List, Optional
import os

from utils.preprocessor import clean
from utils.model_loader import get_model, reload_model

app = FastAPI(title="UNSAP ML Service", version="2.0")

API_KEY = os.environ.get("ML_API_KEY", "dev-key-insecure")
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
        # Fallback if model is not trained yet
        return ClassifyResponse(
            priority="normal",
            confidence=1.0,
            model_version="fallback"
        )
        
    cleaned_text = clean(req.text)
    
    # Simple rule-based override for critical keywords
    urgent_keywords = ["krs", "nilai", "hilang", "error", "server down", "tidak bisa login"]
    if any(keyword in cleaned_text for keyword in urgent_keywords):
        return ClassifyResponse(
            priority="urgent",
            confidence=1.0,
            model_version="rule_based"
        )
        
    # Transform
    vec = vectorizer.transform([cleaned_text])
    
    # Predict
    pred = model.predict(vec)[0]
    
    # Confidence
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vec)[0]
        confidence = float(max(probs))
    else:
        confidence = 1.0
        
    return ClassifyResponse(
        priority=pred,
        confidence=confidence,
        model_version=model_version
    )

@app.post("/faq-suggest")
def suggest_faq(req: FaqSuggestRequest, api_key: str = Depends(verify_api_key)):
    # Placeholder for FAQ Suggestion (TF-IDF similarity against FAQ DB)
    return {
        "suggestions": [
            {"faq_id": "1", "score": 0.85, "question": "Bagaimana cara isi KRS?"}
        ]
    }

@app.post("/sentiment")
def analyze_sentiment(req: SentimentRequest, api_key: str = Depends(verify_api_key)):
    # Placeholder for simple lexicon-based sentiment
    cleaned_text = clean(req.text)
    negative_words = ["kecewa", "buruk", "lambat", "susah", "error", "jelek"]
    if any(word in cleaned_text for word in negative_words):
        return {"sentiment": "negative", "score": -0.8}
    return {"sentiment": "neutral", "score": 0.0}

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
