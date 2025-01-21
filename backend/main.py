from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import routes.lp_router
import routes.user_router

app = FastAPI()

app.include_router(routes.user_router.router, prefix="/users", tags=["Users"])
app.include_router(routes.lp_router.router, prefix="/lps", tags=["LPs"])

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용. 보안이 중요하다면 특정 도메인으로 제한.
    allow_credentials=True,  # 쿠키를 포함한 자격 증명 허용
    allow_methods=["*"],  # 모든 HTTP 메서드 허용 (GET, POST, PUT 등)
    allow_headers=["*"],  # 모든 헤더 허용
)

@app.get("/")
async def read_root():
    return {"message": "MongoDB 튜토리얼 FastAPI에 오신 것을 환영합니다!"}

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response