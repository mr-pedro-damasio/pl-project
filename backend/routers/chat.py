from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import get_current_user_id
from services.ai_service import get_chat_response
from services.doc_registry import get_doc_spec

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    patch: dict


@router.post("/{doc_type_id}", response_model=ChatResponse)
def chat_doc(
    doc_type_id: str,
    req: ChatRequest,
    user_id: int = Depends(get_current_user_id),
):
    if get_doc_spec(doc_type_id) is None:
        raise HTTPException(status_code=404, detail=f"Unknown document type: {doc_type_id}")
    try:
        result = get_chat_response(doc_type_id, [m.model_dump() for m in req.messages])
        return ChatResponse(reply=result["reply"], patch=result["patch"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
