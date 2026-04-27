import { apiFetch } from "./auth";
import { DocumentState } from "./doc-configs/types";

export interface SavedDocument {
  id: number;
  doc_type_id: string;
  title: string;
  state_json: string;
  created_at: string;
  updated_at: string;
}

export async function listDocuments(): Promise<SavedDocument[]> {
  const res = await apiFetch("/api/documents");
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json();
}

export async function getDocument(id: number): Promise<SavedDocument> {
  const res = await apiFetch(`/api/documents/${id}`);
  if (!res.ok) throw new Error("Document not found");
  return res.json();
}

export async function createDocument(
  doc_type_id: string,
  title: string,
  state: DocumentState
): Promise<SavedDocument> {
  const res = await apiFetch("/api/documents", {
    method: "POST",
    body: JSON.stringify({ doc_type_id, title, state_json: JSON.stringify(state) }),
  });
  if (!res.ok) throw new Error("Failed to save document");
  return res.json();
}

export async function updateDocument(
  id: number,
  title: string,
  state: DocumentState
): Promise<SavedDocument> {
  const res = await apiFetch(`/api/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, state_json: JSON.stringify(state) }),
  });
  if (!res.ok) throw new Error("Failed to update document");
  return res.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const res = await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
}
