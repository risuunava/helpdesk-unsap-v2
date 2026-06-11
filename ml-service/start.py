"""
Startup script for Railway deployment.
Runs training and FAQ sync before starting the uvicorn server.
"""
import subprocess
import sys
import os
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "models"
DATASETS_DIR = Path(__file__).parent / "datasets"

def run_training():
    """Train the ML model if no model exists."""
    model_files = list(MODEL_DIR.glob("model_*.pkl"))
    if model_files:
        print(f"[STARTUP] Model already exists: {model_files[0].name}. Skipping training.")
        return
    
    print("[STARTUP] No model found. Running training...")
    try:
        result = subprocess.run(
            [sys.executable, "train.py"],
            capture_output=True, text=True, timeout=120
        )
        print(result.stdout)
        if result.returncode != 0:
            print(f"[STARTUP] Training stderr: {result.stderr}")
        else:
            print("[STARTUP] Training completed successfully.")
    except Exception as e:
        print(f"[STARTUP] Training failed: {e}")

def sync_faqs():
    """Sync FAQs from Supabase if credentials are available."""
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("[STARTUP] No Supabase credentials found. Skipping FAQ sync.")
        return
    
    print("[STARTUP] Syncing FAQs from Supabase...")
    try:
        from supabase import create_client
        import json
        
        client = create_client(supabase_url, supabase_key)
        response = client.table("faqs").select("id, question, answer, category").eq("is_active", True).execute()
        faqs = response.data or []
        
        DATASETS_DIR.mkdir(exist_ok=True)
        faq_path = DATASETS_DIR / "faqs.json"
        with open(faq_path, "w", encoding="utf-8") as f:
            json.dump(faqs, f, indent=2, ensure_ascii=False)
        
        print(f"[STARTUP] Synced {len(faqs)} FAQs to {faq_path}")
    except Exception as e:
        print(f"[STARTUP] FAQ sync failed: {e}")

def start_server():
    """Start the uvicorn server."""
    port = os.environ.get("PORT", "8000")
    print(f"[STARTUP] Starting uvicorn on port {port}...")
    os.execvp(
        sys.executable,
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", port]
    )

if __name__ == "__main__":
    MODEL_DIR.mkdir(exist_ok=True)
    DATASETS_DIR.mkdir(exist_ok=True)
    
    sync_faqs()
    run_training()
    start_server()
