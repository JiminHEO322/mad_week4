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

def mood_extraction(message: str, top_n: int = 3):
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
        
        emotions = sorted(data[0], key=lambda x: x["score"], reverse=True)  # 점수 기준 정렬
        return [{"label": emo["label"], "score": round(emo["score"], 3)} for emo in emotions[:top_n]]
    
    except (KeyError, IndexError, ValueError) as e:
        print(f"Error processing response: {e}")
        return [{"label": "unknown", "score": 0.0}] 

def keyword_extraction(message: str, top_n: int = 5, diversity: float = 0.7):
    kw_model = KeyBERT()
    single_word_keywords = kw_model.extract_keywords(
        message,
        keyphrase_ngram_range=(1, 1),  # 단일 단어만 추출
        stop_words='english',
        top_n=1,  # 가장 상위 한 단어만 추출
        use_maxsum=False,  # 간단한 추출
        use_mmr=False
    )
    combined_keywords = kw_model.extract_keywords(
        message,
        keyphrase_ngram_range=(1, 2),  # 1~2개의 단어 조합 허용
        stop_words='english',
        top_n=top_n,
        use_maxsum=True,
        use_mmr=True,
        diversity=diversity  # 다양성을 조정
    )
    
    final_keywords = [single_word_keywords[0][0]] if single_word_keywords else []
    final_keywords += [kw[0] for kw in combined_keywords]
    
    # 중복 제거
    return list(dict.fromkeys(final_keywords))
