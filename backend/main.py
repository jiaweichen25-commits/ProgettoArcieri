from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import auth_controller, istruttori_controller, atleti_controller, allenamenti_controller, atleta_controller

app = FastAPI(title="API Arcieri Vicenza")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_controller.router)
app.include_router(istruttori_controller.router)
app.include_router(atleti_controller.router)
app.include_router(allenamenti_controller.router)
app.include_router(atleta_controller.router)


@app.get("/")
def read_root():
    return {"message": "API Arcieri Vicenza attiva"}
