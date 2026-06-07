import re
import string

# We will implement a lightweight, zero-dependency preprocessing logic if possible,
# or we will define the functions for NLTK and PySastrawi.
# In B08, it requests NLTK + PySastrawi.
try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    import nltk
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
except ImportError:
    # We will raise a clear error so the user knows what to install,
    # or handle it gracefully if this is just a skeleton.
    pass

class Preprocessor:
    def __init__(self):
        # Initialize Stemmer
        try:
            factory = StemmerFactory()
            self.stemmer = factory.create_stemmer()
        except:
            print("Warning: Sastrawi not found. Stemming disabled.")
            self.stemmer = None
        
        # We assume NLTK data is downloaded. If not, train.py/main.py will have to download it.
        try:
            self.stop_words = set(stopwords.words('indonesian'))
        except:
            # Fallback custom stopwords
            self.stop_words = {"yang", "di", "ke", "dari", "pada", "dalam", "untuk", "dengan", "dan", "atau", "ini", "itu", "saya", "kami", "kita", "mereka", "dia"}
            
        self.custom_stopwords = {"unsap", "helpdesk", "kampus", "mohon", "bantu", "tolong", "admin", "bapak", "ibu"}
        self.stop_words.update(self.custom_stopwords)

    def clean_text(self, text: str) -> str:
        if not text or not isinstance(text, str):
            return ""
            
        # 1. Lowercase
        text = text.lower()
        
        # 2. Tokenisasi
        try:
            tokens = word_tokenize(text)
        except:
            tokens = text.split()
            
        # 3. Remove Stopwords
        filtered_tokens = [w for w in tokens if w not in self.stop_words]
        
        # 4. Stemming (optional if available)
        if self.stemmer:
            try:
                stemmed_text = " ".join([self.stemmer.stem(w) for w in filtered_tokens])
                return stemmed_text
            except:
                pass
                
        return " ".join(filtered_tokens)

# Singleton instance
_preprocessor = None

def get_preprocessor():
    global _preprocessor
    if _preprocessor is None:
        _preprocessor = Preprocessor()
    return _preprocessor

def clean(text: str) -> str:
    return get_preprocessor().clean_text(text)
