import joblib
import os
from pathlib import Path

MODEL_DIR = Path(__file__).parent.parent / "models"
_model = None
_vectorizer = None
_model_version = None

def load_model():
    global _model, _vectorizer, _model_version
    
    # Load model .pkl terbaru dari folder models/
    model_files = sorted(MODEL_DIR.glob("model_*.pkl"), reverse=True)
    if not model_files:
        # Don't throw exception on load, allow the app to start without model (cold start)
        print("Warning: No model found. Run train.py first.")
        return
        
    latest = model_files[0]
    _model_version = latest.stem
    _model = joblib.load(latest)
    
    vec_path = MODEL_DIR / "vectorizer.pkl"
    if vec_path.exists():
        _vectorizer = joblib.load(vec_path)
    else:
        print("Warning: vectorizer.pkl not found.")

def get_model():
    if _model is None:
        load_model()
    return _model, _vectorizer, _model_version

def reload_model():
    """Reload model tanpa restart server - dipanggil setelah retrain."""
    global _model, _vectorizer, _model_version
    _model = _vectorizer = _model_version = None
    load_model()
