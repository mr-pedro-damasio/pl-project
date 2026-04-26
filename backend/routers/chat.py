from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import get_current_user_id
from services.ai_service import get_chat_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    patch: dict


@router.post("/nda", response_model=ChatResponse)
def chat_nda(req: ChatRequest, user_id: int = Depends(get_current_user_id)):
    try:
        result = get_chat_response([m.model_dump() for m in req.messages])
        return ChatResponse(
            reply=result.reply,
            patch=result.patch.model_dump(exclude_none=True),
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
