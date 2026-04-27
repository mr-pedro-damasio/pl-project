"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DocTypeConfig, DocumentState, GenericFieldPatch } from "@/app/lib/doc-configs/types";
import { buildDefaultState, mergeState } from "@/app/lib/state-utils";
import { clearToken } from "@/app/lib/auth";
import { createDocument, updateDocument } from "@/app/lib/api-documents";
import { downloadDocx } from "@/app/lib/export-docx";
import GenericDocumentForm from "./GenericDocumentForm";
import GenericDocumentPreview from "./GenericDocumentPreview";
import DocumentChat from "./DocumentChat";

interface Props {
  config: DocTypeConfig;
  initialState?: DocumentState;
  initialDocumentId?: number | null;
}

export default function DocumentCreator({ config, initialState, initialDocumentId = null }: Props) {
  const router = useRouter();
  const [state, setState] = useState<DocumentState>(() => initialState ?? buildDefaultState(config));
  const [activeTab, setActiveTab] = useState<"chat" | "form">("chat");
  const [documentId, setDocumentId] = useState<number | null>(initialDocumentId);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [docxStatus, setDocxStatus] = useState<"idle" | "generating">("idle");

  function handlePrint() {
    window.print();
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  function handleFieldsExtracted(patch: GenericFieldPatch) {
    setState((prev) => mergeState(prev, patch));
  }

  async function handleSave() {
    setSaveStatus("saving");
    try {
      const title =
        state.fields["customer_name"] ||
        state.partyA?.company ||
        state.partyB?.company ||
        config.displayName;
      if (documentId) {
        await updateDocument(documentId, title, state);
      } else {
        const saved = await createDocument(config.docTypeId, title, state);
        setDocumentId(saved.id);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  const handleDownloadDocx = useCallback(async () => {
    if (docxStatus === "generating") return;
    setDocxStatus("generating");
    try {
      await downloadDocx(config, state);
    } finally {
      setDocxStatus("idle");
    }
  }, [config, state, docxStatus]);

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
      ? "Saved!"
      : saveStatus === "error"
      ? "Error"
      : documentId
      ? "Save"
      : "Save";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Header */}
      <header className="no-print sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-slate-400 hover:text-slate-600 transition flex items-center gap-1"
          >
            ← All Documents
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#209dd7" }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-none">{config.displayName}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Common Paper Standard Terms</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-all active:scale-95"
            style={{
              borderColor: saveStatus === "saved" ? "#22c55e" : saveStatus === "error" ? "#ef4444" : "#e2e8f0",
              color: saveStatus === "saved" ? "#22c55e" : saveStatus === "error" ? "#ef4444" : "#475569",
              backgroundColor: "white",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {saveLabel}
          </button>
          {/* Download DOCX */}
          <button
            onClick={handleDownloadDocx}
            disabled={docxStatus === "generating"}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm active:scale-95 transition-all disabled:opacity-60"
            style={{ backgroundColor: "#753991" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {docxStatus === "generating" ? "Generating…" : "Download DOCX"}
          </button>
          {/* Download PDF via print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm active:scale-95 transition-all"
            style={{ backgroundColor: "#209dd7" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / PDF
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="print-wrapper flex gap-0 h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="no-print w-96 shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 shrink-0">
            {(["chat", "form"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-sm font-medium capitalize transition-colors"
                style={{
                  color: activeTab === tab ? "#032147" : "#888888",
                  borderBottom: activeTab === tab ? "2px solid #209dd7" : "2px solid transparent",
                }}
              >
                {tab === "chat" ? "AI Chat" : "Form"}
              </button>
            ))}
          </div>

          {/* Panels — CSS hidden to preserve chat state across tab switches */}
          <div className={`flex-1 overflow-y-auto p-6 ${activeTab === "chat" ? "flex flex-col" : "hidden"}`}>
            <DocumentChat docTypeId={config.docTypeId} onFieldsExtracted={handleFieldsExtracted} />
          </div>
          <div className={`flex-1 overflow-y-auto p-6 ${activeTab === "form" ? "block" : "hidden"}`}>
            <GenericDocumentForm config={config} state={state} onChange={setState} />
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <GenericDocumentPreview config={config} state={state} />
          </div>
        </main>
      </div>
    </div>
  );
}
