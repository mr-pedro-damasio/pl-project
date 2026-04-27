"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/app/lib/auth";
import { listDocuments, deleteDocument, SavedDocument } from "@/app/lib/api-documents";
import { getDocConfig } from "@/app/lib/doc-configs";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DocumentsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    listDocuments()
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setDeleteError("Failed to delete document. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(doc: SavedDocument) {
    router.push(`/create/${doc.doc_type_id}/?id=${doc.id}`);
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#209dd7" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none" style={{ color: "#032147" }}>
              Prelegal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">AI Legal Document Creator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            ← New Document
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#032147" }}>
            My Documents
          </h2>
          <p className="text-slate-500">Your saved legal agreements.</p>
        </div>

        {deleteError && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {deleteError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "#209dd7", animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No saved documents yet.</p>
            <p className="text-sm mt-1">
              Create a document and click{" "}
              <span className="font-semibold">Save</span> to store it here.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-lg px-5 py-2 text-sm font-medium text-white transition active:scale-95"
              style={{ backgroundColor: "#753991" }}
            >
              Create a Document
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map((doc) => {
              const cfg = getDocConfig(doc.doc_type_id);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#209dd7" }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {cfg?.displayName ?? doc.doc_type_id} · Updated {formatDate(doc.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white transition active:scale-95"
                      style={{ backgroundColor: "#753991" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
                    >
                      {deletingId === doc.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
