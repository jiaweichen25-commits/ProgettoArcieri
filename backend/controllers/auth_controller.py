from fastapi import APIRouter, status
from schemas.auth_schemas import LoginInput, TokenOutput, RegisterInput
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput):
    token = auth_service.authenticate_user(data.email, data.password)
    return TokenOutput(access_token=token, token_type="bearer")

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterInput):
    token = auth_service.register_user(data.email, data.password, data.ruolo)
    return {"access_token": token, "token_type": "bearer"}
