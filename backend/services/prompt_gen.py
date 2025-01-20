import json
import deepl
import requests
from keybert import KeyBERT
import os
from dotenv import load_dotenv

load_dotenv()
DEEPL_API_KEY = os.getenv('DEEPL_API_KEY')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

def english_translation(message: str):
    auth_key = DEEPL_API_KEY
    translator = deepl.Translator(auth_key)
    result = translator.translate_text(message, source_lang='KO', target_lang='EN-US')
    return result.text

def mood_extraction(message: str):
    API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/distilbert-base-uncased-emotion"
    headers = {"Authorization": HUGGINGFACE_API_KEY}

    payload = {"inputs": message}
    response = requests.post(API_URL, headers=headers, json=payload)
    
    print("API Response:", response.text)

    try:
        data = json.loads(response.text)
        
        if not data or not isinstance(data, list):
            raise ValueError("Invalid response structure or empty response.")
        
        if not isinstance(data[0], list) or len(data[0]) == 0:
            raise ValueError("Unexpected response format.")
        
        return data[0][0]["label"]
    
    except (KeyError, IndexError, ValueError) as e:
        print(f"Error processing response: {e}")
        return "unknown"  # 기본값 반환

def keyword_extraction(message: str):
    kw_model = KeyBERT()
    keywords = kw_model.extract_keywords(message, top_n=1)
    return keywords[0][0]
