"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/app/lib/auth";
import { DASHBOARD_DOCS, DocTypeConfig } from "@/app/lib/doc-configs";

function DocCard({ config, onClick }: { config: DocTypeConfig; onClick: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">{config.displayName}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{config.description}</p>
        {config.isSupplementDoc && (
          <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Supplement
          </span>
        )}
      </div>
      <button
        onClick={onClick}
        className="w-full rounded-lg py-2 text-sm font-medium text-white transition active:scale-95"
        style={{ backgroundColor: "#753991" }}
      >
        Create
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#209dd7" }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none" style={{ color: "#032147" }}>Prelegal</h1>
            <p className="text-xs text-slate-400 mt-0.5">AI Legal Document Creator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#032147" }}>Choose a Document</h2>
          <p className="text-slate-500">Select a legal agreement to draft with AI assistance.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DASHBOARD_DOCS.map((config) => (
            <DocCard
              key={config.docTypeId}
              config={config}
              onClick={() => router.push(`/create/${config.docTypeId}/`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
