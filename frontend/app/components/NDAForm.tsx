"use client";

import { NDAFormData, PartyInfo } from "@/app/lib/types";

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
      {children}
    </h2>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {hint && <span className="ml-1 text-xs text-slate-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition";

const textareaClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition resize-none";

function PartyFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PartyInfo;
  onChange: (v: PartyInfo) => void;
}) {
  function update(field: keyof PartyInfo, val: string) {
    onChange({ ...value, [field]: val });
  }
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-indigo-600">{label}</p>
      <Field label="Legal Name">
        <input
          className={inputClass}
          placeholder="Jane Smith"
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </Field>
      <Field label="Title">
        <input
          className={inputClass}
          placeholder="Chief Executive Officer"
          value={value.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>
      <Field label="Company">
        <input
          className={inputClass}
          placeholder="Acme Corp"
          value={value.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </Field>
      <Field label="Notice Address" hint="email or postal">
        <input
          className={inputClass}
          placeholder="legal@acme.com"
          value={value.noticeAddress}
          onChange={(e) => update("noticeAddress", e.target.value)}
        />
      </Field>
      <Field label="Date">
        <input
          type="date"
          className={inputClass}
          value={value.date}
          onChange={(e) => update("date", e.target.value)}
        />
      </Field>
    </div>
  );
}

export default function NDAForm({ data, onChange }: Props) {
  function set<K extends keyof NDAFormData>(key: K, val: NDAFormData[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="space-y-8">
      {/* Agreement Details */}
      <section>
        <SectionHeading>Agreement Details</SectionHeading>

        <Field label="Purpose" hint="how confidential information may be used">
          <textarea
            rows={3}
            className={textareaClass}
            placeholder="Evaluating whether to enter into a business relationship with the other party."
            value={data.purpose}
            onChange={(e) => set("purpose", e.target.value)}
          />
        </Field>

        <Field label="Effective Date">
          <input
            type="date"
            className={inputClass}
            value={data.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </Field>
      </section>

      {/* MNDA Term */}
      <section>
        <SectionHeading>MNDA Term</SectionHeading>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="mndaTermType"
              value="expires"
              checked={data.mndaTermType === "expires"}
              onChange={() => set("mndaTermType", "expires")}
              className="mt-0.5 accent-indigo-600"
            />
            <div className="flex-1">
              <span className="text-sm text-slate-700">
                Expires after a fixed number of years
              </span>
              {data.mndaTermType === "expires" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={`${inputClass} w-20`}
                    value={data.mndaTermYears}
                    onChange={(e) => set("mndaTermYears", e.target.value)}
                  />
                  <span className="text-sm text-slate-500">year(s)</span>
                </div>
              )}
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="mndaTermType"
              value="until-terminated"
              checked={data.mndaTermType === "until-terminated"}
              onChange={() => set("mndaTermType", "until-terminated")}
              className="mt-0.5 accent-indigo-600"
            />
            <span className="text-sm text-slate-700">
              Continues until terminated in accordance with the MNDA
            </span>
          </label>
        </div>
      </section>

      {/* Term of Confidentiality */}
      <section>
        <SectionHeading>Term of Confidentiality</SectionHeading>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="confidentialityTermType"
              value="fixed"
              checked={data.confidentialityTermType === "fixed"}
              onChange={() => set("confidentialityTermType", "fixed")}
              className="mt-0.5 accent-indigo-600"
            />
            <div className="flex-1">
              <span className="text-sm text-slate-700">
                Fixed number of years from Effective Date
              </span>
              {data.confidentialityTermType === "fixed" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={`${inputClass} w-20`}
                    value={data.confidentialityTermYears}
                    onChange={(e) =>
                      set("confidentialityTermYears", e.target.value)
                    }
                  />
                  <span className="text-sm text-slate-500">year(s)</span>
                </div>
              )}
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="confidentialityTermType"
              value="perpetual"
              checked={data.confidentialityTermType === "perpetual"}
              onChange={() => set("confidentialityTermType", "perpetual")}
              className="mt-0.5 accent-indigo-600"
            />
            <span className="text-sm text-slate-700">In perpetuity</span>
          </label>
        </div>
      </section>

      {/* Governing Law */}
      <section>
        <SectionHeading>Governing Law & Jurisdiction</SectionHeading>
        <Field label="Governing Law" hint="state name">
          <input
            className={inputClass}
            placeholder="Delaware"
            value={data.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
          />
        </Field>
        <Field label="Jurisdiction" hint="city/county and state">
          <input
            className={inputClass}
            placeholder="New Castle, Delaware"
            value={data.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
          />
        </Field>
      </section>

      {/* Signatories */}
      <section>
        <SectionHeading>Signatories</SectionHeading>
        <div className="space-y-6">
          <PartyFields
            label="Party 1"
            value={data.party1}
            onChange={(v) => set("party1", v)}
          />
          <div className="border-t border-slate-100 pt-6">
            <PartyFields
              label="Party 2"
              value={data.party2}
              onChange={(v) => set("party2", v)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
