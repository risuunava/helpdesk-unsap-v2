import os
import joblib
import pandas as pd
from datetime import datetime
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from supabase import create_client, Client

import nltk
# Ensure NLTK resources are available
def setup_nltk():
    resources = ['stopwords', 'punkt']
    for res in resources:
        try:
            nltk.download(res, quiet=True)
        except Exception as e:
            print(f"Warning: Failed to download NLTK resource {res}: {e}")

setup_nltk()

from utils.preprocessor import clean

MODEL_DIR = Path(__file__).parent / "models"
DATA_DIR = Path(__file__).parent / "datasets"

# Create directories if they don't exist
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def load_data():
    df = None
    # Try fetching from Supabase if env vars are set
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            print("Fetching data from Supabase...")
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            response = supabase.table("ml_training_data").select("text_input, corrected_label").execute()
            
            if response.data and len(response.data) > 0:
                df = pd.DataFrame(response.data)
                # Rename columns for consistency if needed, but here we just use them
                df = df.rename(columns={"text_input": "text", "corrected_label": "label"})
                print(f"Loaded {len(df)} rows from Supabase.")
        except Exception as e:
            print(f"Failed to fetch from Supabase: {e}")
            
    # Fallback to CSV
    if df is None or len(df) == 0:
        csv_path = DATA_DIR / "dataset.csv"
        if csv_path.exists():
            print(f"Loading data from {csv_path}...")
            try:
                # Manual parsing to handle commas inside text (e.g. "2,0")
                data = []
                with open(csv_path, "r", encoding="utf-8") as f:
                    header = f.readline() # skip header
                    for line in f:
                        line = line.strip()
                        if not line: continue
                        # Split from the right, only 1 split (last comma is the label)
                        parts = line.rsplit(",", 1)
                        if len(parts) == 2:
                            data.append({"text": parts[0], "label": parts[1]})
                
                if data:
                    df = pd.DataFrame(data)
                    print(f"Loaded {len(df)} rows from CSV (manually parsed).")
            except Exception as e:
                print(f"Failed to parse CSV manually: {e}")
                # Last resort fallback to standard pandas
                try:
                    df = pd.read_csv(csv_path)
                except:
                    pass
        else:
            # Generate a dummy dataset if neither exists (for testing purposes)
            print("No database or CSV found. Generating dummy dataset...")
            dummy_data = {
                "text": [
                    "KRS saya error tidak bisa pilih jadwal",
                    "Aplikasi sering crash saat dibuka",
                    "Tolong bantu saya lupa password",
                    "Kapan jadwal perwalian dimulai?",
                    "Wifi di perpustakaan lambat sekali",
                    "AC di ruang kelas panas",
                    "Cara ganti foto profil bagaimana ya?",
                    "Sistem error 500",
                    "Tidak bisa cetak kartu ujian"
                ],
                "label": [
                    "urgent", "urgent", "high", "normal", "low", "low", "low", "urgent", "high"
                ]
            }
            df = pd.DataFrame(dummy_data)
            df.to_csv(csv_path, index=False)
            
    return df

def train():
    print("Starting training process...")
    df = load_data()
    
    # Preprocess texts
    print("Preprocessing texts...")
    df['cleaned_text'] = df['text'].apply(clean)
    
    # Drop empty texts
    df = df[df['cleaned_text'].str.strip() != '']
    
    if len(df) < 5:
        print("Not enough data to train. Need at least 5 samples.")
        return

    # Feature extraction & Model
    print("\n" + "="*60)
    print("  MODEL TRAINING REPORT")
    print("="*60)
    print(f"  Algoritma       : Logistic Regression")
    print(f"  Vectorizer      : TF-IDF (max_features=5000, ngram=(1,2))")
    print(f"  Total data      : {len(df)} sampel")
    print(f"  Kelas target    : {sorted(df['label'].unique().tolist())}")
    print("="*60)
    print("\nDistribusi Kelas:")
    for label, count in df['label'].value_counts().items():
        pct = count / len(df) * 100
        print(f"  {label:<10} : {count} sampel ({pct:.1f}%)")

    # Split data: 80% training, 20% testing
    X_all = df['cleaned_text']
    y_all = df['label']
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_all, y_all, test_size=0.2, random_state=42, stratify=y_all
    )

    print(f"\nPembagian Data:")
    print(f"  Data Training   : {len(X_train_raw)} sampel (80%)")
    print(f"  Data Testing    : {len(X_test_raw)} sampel (20%)")

    # Train
    print("\nMemulai training...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    model = LogisticRegression(max_iter=1000, class_weight='balanced')

    X_train = vectorizer.fit_transform(X_train_raw)
    X_test  = vectorizer.transform(X_test_raw)

    model.fit(X_train, y_train)

    # Evaluate on test set
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("\n" + "="*60)
    print("  HASIL EVALUASI (Data Uji 20%)")
    print("="*60)
    print(f"  Akurasi Keseluruhan : {acc*100:.2f}%")
    print("\nLaporan Klasifikasi per Label:")
    report = classification_report(y_test, y_pred, digits=4)
    # Indent tiap baris untuk keterbacaan
    for line in report.splitlines():
        print("  " + line)

    # Confusion matrix
    labels_order = sorted(df['label'].unique().tolist())
    cm = confusion_matrix(y_test, y_pred, labels=labels_order)
    print("\nConfusion Matrix (baris=aktual, kolom=prediksi):")
    header = "  " + " " * 10 + "".join(f"{l:>10}" for l in labels_order)
    print(header)
    for i, row_label in enumerate(labels_order):
        row_str = "  " + f"{row_label:<10}" + "".join(f"{v:>10}" for v in cm[i])
        print(row_str)
    print("="*60)

    # Retrain on ALL data for final saved model
    print("\nMelatih ulang model dengan SELURUH data untuk deployment...")
    X_full = vectorizer.fit_transform(X_all)
    model.fit(X_full, y_all)

    # Save model and vectorizer
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_filename = f"model_{timestamp}.pkl"

    joblib.dump(model, MODEL_DIR / model_filename)
    joblib.dump(vectorizer, MODEL_DIR / "vectorizer.pkl")

    print(f"\n[OK] Model tersimpan   : models/{model_filename}")
    print(f"[OK] Vectorizer        : models/vectorizer.pkl")
    print("="*60 + "\n")

if __name__ == "__main__":
    train()
