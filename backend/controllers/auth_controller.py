from fastapi import APIRouter, status, Depends
from schemas.auth_schemas import LoginInput, TokenOutput, RegisterInput, ChangePasswordInput
from services import auth_service
from dependencies.auth_deps import get_utente_loggato

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput):
    token, must_change = auth_service.authenticate_user(data.email, data.password, data.portale)
    return TokenOutput(access_token=token, token_type="bearer", must_change_password=must_change)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterInput):
    token = auth_service.register_user(
        data.email,
        data.password,
        data.ruolo,
        nome=data.nome,
        cognome=data.cognome,
        qualifica=data.qualifica,
    )
    return {"access_token": token, "token_type": "bearer", "must_change_password": False}

@router.post("/change-password")
def change_password(data: ChangePasswordInput, utente: dict = Depends(get_utente_loggato)):
    auth_service.change_user_password(utente["email"], data.old_password, data.new_password)
    return {"message": "Password modificata con successo"}
