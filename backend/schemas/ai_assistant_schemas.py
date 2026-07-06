from pydantic import BaseModel, Field
from typing import Optional

class AIAssistantQueryInput(BaseModel):
    domanda: str = Field(min_length=3, max_length=2000)
    id_atleta: Optional[int] = None

class AIAssistantQueryOutput(BaseModel):
    risposta: str
    id_atleta: Optional[int] = None
