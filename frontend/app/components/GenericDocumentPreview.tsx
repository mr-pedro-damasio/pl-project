"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useMemo } from "react";
import { DocTypeConfig, DocumentState, FieldDef, PartyData } from "@/app/lib/doc-configs/types";
import { substituteTemplate, buildTemplateValues } from "@/app/lib/template-engine";

interface Props {
  config: DocTypeConfig;
  state: DocumentState;
}

function formatDate(iso: string): string {
  if (!iso) return "[Date]";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Placeholder({ text }: { text: string }) {
  return <span className="field-placeholder">{text}</span>;
}

function FieldValue({ val, fallback }: { val: string; fallback: string }) {
  return val ? <span className="field-value">{val}</span> : <Placeholder text={fallback} />;
}

function CoverRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
      <div className="w-44 shrink-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function SignatureLine({ label, value, blank }: { label: string; value: string; blank?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
      {blank ? (
        <span className="flex-1 border-b border-slate-300 h-5" />
      ) : (
        <span className="flex-1 border-b border-slate-300 text-slate-800 pb-0.5 min-h-5">{value}</span>
      )}
    </div>
  );
}

function SignatureBlock({ label, party }: { label: string; party: PartyData }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3 text-sm">
      <p className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">{label}</p>
      <SignatureLine label="Signature" value="" blank />
      <SignatureLine label="Print Name" value={party.name} />
      <SignatureLine label="Title" value={party.title} />
      <SignatureLine label="Company" value={party.company} />
      <SignatureLine label="Notice" value={party.noticeAddress} />
      <SignatureLine label="Date" value={party.date ? formatDate(party.date) : ""} />
    </div>
  );
}

function CoverPage({ config, state, computedValues }: { config: DocTypeConfig; state: DocumentState; computedValues: Record<string, string> }) {
  const coverFields: FieldDef[] = config.fields
    .filter((f) => f.coverPageOrder !== undefined)
    .sort((a, b) => (a.coverPageOrder ?? 0) - (b.coverPageOrder ?? 0));

  return (
    <div className="cover-page">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "#032147" }}>
          {config.displayName}
        </h1>
        <p className="text-sm text-slate-500">Common Paper Standard Terms</p>
      </div>

      {config.coverPage.intro && (
        <div className="text-sm text-slate-600 mb-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
          {config.coverPage.intro}
        </div>
      )}

      <div className="space-y-5">
        {coverFields.map((field) => {
          const label = field.coverPageLabel ?? field.label;
          // Use computed value if available, otherwise raw field value
          const computedVal = field.templateMarker ? computedValues[field.templateMarker] : undefined;
          const rawVal = state.fields[field.key] ?? "";
          const displayVal = computedVal ?? (field.type === "date" && rawVal ? formatDate(rawVal) : rawVal);

          return (
            <CoverRow key={field.key} label={label}>
              <FieldValue val={displayVal} fallback={`[${label}]`} />
            </CoverRow>
          );
        })}
      </div>

      {config.coverPage.showSignatures && state.partyA && state.partyB && (
        <div className="mt-10">
          <p className="text-sm text-slate-600 mb-6">
            By signing this Cover Page, each party agrees to enter into this Agreement as of the Effective Date.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <SignatureBlock label={config.coverPage.partyALabel} party={state.partyA} />
            <SignatureBlock label={config.coverPage.partyBLabel} party={state.partyB} />
          </div>
        </div>
      )}
    </div>
  );
}

function StandardTerms({ templateContent, templateValues }: { templateContent: string; templateValues: Record<string, string> }) {
  const rendered = useMemo(() => substituteTemplate(templateContent, templateValues), [templateContent, templateValues]);
  return (
    <div className="standard-terms prose prose-slate prose-sm max-w-none mt-10 pt-10 border-t border-slate-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {rendered}
      </ReactMarkdown>
    </div>
  );
}

export default function GenericDocumentPreview({ config, state }: Props) {
  const computedValues = useMemo(
    () => buildTemplateValues(config.fields, state, config.computedTemplateValues),
    [config, state]
  );

  return (
    <div className="nda-document bg-white rounded-xl shadow-lg border border-slate-200 p-10 text-slate-800 font-sans">
      <CoverPage config={config} state={state} computedValues={computedValues} />
      <StandardTerms templateContent={config.templateContent} templateValues={computedValues} />
    </div>
  );
}
