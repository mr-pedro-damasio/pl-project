"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { NDAFormData } from "@/app/lib/types";
import { buildStandardTerms } from "@/app/lib/nda-template";

interface Props {
  data: NDAFormData;
}

function formatDate(iso: string): string {
  if (!iso) return "[Date]";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function placeholder(val: string, fallback: string): React.ReactNode {
  return val ? (
    <span className="field-value">{val}</span>
  ) : (
    <span className="field-placeholder">{fallback}</span>
  );
}

function pluralYears(n: number): string {
  return `${n} year${n !== 1 ? "s" : ""}`;
}

function CoverPage({ data }: { data: NDAFormData }) {
  const mndaYears = Math.max(1, Number(data.mndaTermYears) || 1);
  const mndaTerm =
    data.mndaTermType === "expires"
      ? `${pluralYears(mndaYears)} from Effective Date`
      : "Until terminated";

  const confYears = Math.max(1, Number(data.confidentialityTermYears) || 1);
  const confidentialityTerm =
    data.confidentialityTermType === "fixed"
      ? `${pluralYears(confYears)} from Effective Date`
      : "In perpetuity";

  return (
    <div className="cover-page">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="text-sm text-slate-500">
          Common Paper MNDA — Version 1.0
        </p>
      </div>

      <div className="text-sm text-slate-600 mb-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
        This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists
        of: (1) this Cover Page and (2) the Common Paper Mutual NDA Standard
        Terms Version 1.0. Any modifications of the Standard Terms should be
        made on the Cover Page, which will control over conflicts with the
        Standard Terms.
      </div>

      <div className="space-y-5">
        <CoverRow label="Purpose" hint="How Confidential Information may be used">
          {placeholder(
            data.purpose,
            "Evaluating whether to enter into a business relationship with the other party."
          )}
        </CoverRow>

        <CoverRow label="Effective Date">
          {placeholder(
            data.effectiveDate ? formatDate(data.effectiveDate) : "",
            "[Effective Date]"
          )}
        </CoverRow>

        <CoverRow label="MNDA Term" hint="The length of this MNDA">
          <span className="field-value">{mndaTerm}</span>
        </CoverRow>

        <CoverRow
          label="Term of Confidentiality"
          hint="How long Confidential Information is protected"
        >
          <span className="field-value">{confidentialityTerm}</span>
        </CoverRow>

        <CoverRow label="Governing Law & Jurisdiction">
          <div className="space-y-1">
            <div>
              <span className="text-slate-500 text-xs mr-1">
                Governing Law:
              </span>
              {placeholder(data.governingLaw, "[State]")}
            </div>
            <div>
              <span className="text-slate-500 text-xs mr-1">Jurisdiction:</span>
              {placeholder(data.jurisdiction, "[City/County, State]")}
            </div>
          </div>
        </CoverRow>
      </div>

      {/* Signature block */}
      <div className="mt-10">
        <p className="text-sm text-slate-600 mb-6">
          By signing this Cover Page, each party agrees to enter into this MNDA
          as of the Effective Date.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <SignatureBlock label="Party 1" party={data.party1} />
          <SignatureBlock label="Party 2" party={data.party2} />
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400 text-center">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use
        under CC BY 4.0.
      </p>
    </div>
  );
}

function CoverRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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

function SignatureBlock({
  label,
  party,
}: {
  label: string;
  party: NDAFormData["party1"];
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3 text-sm">
      <p className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">
        {label}
      </p>
      <SignatureLine label="Signature" value="" blank />
      <SignatureLine label="Print Name" value={party.name} />
      <SignatureLine label="Title" value={party.title} />
      <SignatureLine label="Company" value={party.company} />
      <SignatureLine label="Notice" value={party.noticeAddress} />
      <SignatureLine label="Date" value={party.date ? formatDate(party.date) : ""} />
    </div>
  );
}

function SignatureLine({
  label,
  value,
  blank,
}: {
  label: string;
  value: string;
  blank?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
      {blank ? (
        <span className="flex-1 border-b border-slate-300 h-5" />
      ) : (
        <span className="flex-1 border-b border-slate-300 text-slate-800 pb-0.5 min-h-5">
          {value}
        </span>
      )}
    </div>
  );
}

function StandardTerms({ data }: { data: NDAFormData }) {
  const content = buildStandardTerms(data);
  return (
    <div className="standard-terms prose prose-slate prose-sm max-w-none mt-10 pt-10 border-t border-slate-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function NDAPreview({ data }: Props) {
  return (
    <div className="nda-document bg-white rounded-xl shadow-lg border border-slate-200 p-10 text-slate-800 font-sans">
      <CoverPage data={data} />
      <StandardTerms data={data} />
    </div>
  );
}
