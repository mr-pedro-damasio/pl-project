"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NDAForm from "./NDAForm";
import NDAPreview from "./NDAPreview";
import { NDAFormData } from "@/app/lib/types";
import { clearToken } from "@/app/lib/auth";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

const defaultData: NDAFormData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: today(),
  mndaTermType: "expires",
  mndaTermYears: "1",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  party1: { name: "", title: "", company: "", noticeAddress: "", date: today() },
  party2: { name: "", title: "", company: "", noticeAddress: "", date: today() },
};

export default function NDACreator() {
  const router = useRouter();
  const [data, setData] = useState<NDAFormData>(defaultData);

  function handlePrint() {
    window.print();
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Header */}
      <header className="no-print sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#209dd7" }}>
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-none">
              Mutual NDA Creator
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Common Paper — Version 1.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm active:scale-95 transition-all"
            style={{ backgroundColor: "#209dd7" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
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
        {/* Form panel */}
        <aside className="no-print w-96 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6">
          <NDAForm data={data} onChange={setData} />
        </aside>

        {/* Preview panel */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <NDAPreview data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}
