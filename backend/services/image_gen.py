import requests
import os
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large"
headers = {"Authorization": HUGGINGFACE_API_KEY}

# 요청 함수
def generate_image(prompt: str):
    payload = {"inputs": prompt}
    response = requests.post(API_URL, headers=headers, json=payload)

    # 요청 성공 여부 확인
    if response.status_code == 200:
        return response.content
    else:
        print(f"Error: {response.status_code}, {response.json()}")
        return None

