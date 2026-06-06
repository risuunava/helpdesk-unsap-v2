import os
import json
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables from Next.js .env.local
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync_faqs():
    print("Fetching active FAQs from Supabase...")
    try:
        response = supabase.table("faqs").select("id, question, answer, category").eq("is_active", True).execute()
        faqs = response.data
        
        if not faqs:
            print("No FAQs found.")
            faqs = []

        # Create datasets dir if not exists
        datasets_dir = Path(__file__).parent / "datasets"
        datasets_dir.mkdir(exist_ok=True)
        
        faq_path = datasets_dir / "faqs.json"
        with open(faq_path, "w", encoding="utf-8") as f:
            json.dump(faqs, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully synced {len(faqs)} FAQs to {faq_path}")
        
    except Exception as e:
        print(f"Failed to sync FAQs: {str(e)}")
        exit(1)

if __name__ == "__main__":
    sync_faqs()
