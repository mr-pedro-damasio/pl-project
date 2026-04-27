import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Document
from auth import get_current_user_id

router = APIRouter(prefix="/api/documents", tags=["documents"])


class DocumentCreate(BaseModel):
    doc_type_id: str
    title: str
    state_json: str


class DocumentUpdate(BaseModel):
    title: str
    state_json: str


class DocumentResponse(BaseModel):
    id: int
    doc_type_id: str
    title: str
    state_json: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


def _to_response(doc: Document) -> DocumentResponse:
    return DocumentResponse(
        id=doc.id,
        doc_type_id=doc.doc_type_id,
        title=doc.title,
        state_json=doc.state_json,
        created_at=doc.created_at.isoformat(),
        updated_at=doc.updated_at.isoformat(),
    )


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    docs = (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.updated_at.desc())
        .all()
    )
    return [_to_response(d) for d in docs]


@router.post("", response_model=DocumentResponse, status_code=201)
def create_document(
    req: DocumentCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc = Document(
        user_id=user_id,
        doc_type_id=req.doc_type_id,
        title=req.title,
        state_json=req.state_json,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _to_response(doc)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _to_response(doc)


@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: int,
    req: DocumentUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.title = req.title
    doc.state_json = req.state_json
    doc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return _to_response(doc)


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
