"use client";

import { DocTypeConfig, DocumentState, FieldDef, PartyData } from "@/app/lib/doc-configs/types";

interface Props {
  config: DocTypeConfig;
  state: DocumentState;
  onChange: (state: DocumentState) => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
      {children}
    </h2>
  );
}

function FieldWrap({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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
const textareaClass = inputClass + " resize-none";

function PartyFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PartyData;
  onChange: (v: PartyData) => void;
}) {
  function update(field: keyof PartyData, val: string) {
    onChange({ ...value, [field]: val });
  }
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-indigo-600">{label}</p>
      <FieldWrap label="Legal Name">
        <input className={inputClass} placeholder="Jane Smith" value={value.name} onChange={(e) => update("name", e.target.value)} />
      </FieldWrap>
      <FieldWrap label="Title">
        <input className={inputClass} placeholder="Chief Executive Officer" value={value.title} onChange={(e) => update("title", e.target.value)} />
      </FieldWrap>
      <FieldWrap label="Company">
        <input className={inputClass} placeholder="Acme Corp" value={value.company} onChange={(e) => update("company", e.target.value)} />
      </FieldWrap>
      <FieldWrap label="Notice Address" hint="email or postal">
        <input className={inputClass} placeholder="legal@acme.com" value={value.noticeAddress} onChange={(e) => update("noticeAddress", e.target.value)} />
      </FieldWrap>
      <FieldWrap label="Date">
        <input type="date" className={inputClass} value={value.date} onChange={(e) => update("date", e.target.value)} />
      </FieldWrap>
    </div>
  );
}

function isVisible(field: FieldDef, fields: Record<string, string>): boolean {
  if (!field.dependsOn) return true;
  return fields[field.dependsOn.field] === field.dependsOn.value;
}

export default function GenericDocumentForm({ config, state, onChange }: Props) {
  function setField(key: string, val: string) {
    onChange({ ...state, fields: { ...state.fields, [key]: val } });
  }

  function renderField(field: FieldDef) {
    if (!isVisible(field, state.fields)) return null;
    const val = state.fields[field.key] ?? "";

    let input: React.ReactNode;

    switch (field.type) {
      case "textarea":
        input = (
          <textarea
            rows={3}
            className={textareaClass}
            placeholder={field.placeholder}
            value={val}
            onChange={(e) => setField(field.key, e.target.value)}
          />
        );
        break;
      case "date":
        input = (
          <input
            type="date"
            className={inputClass}
            value={val}
            onChange={(e) => setField(field.key, e.target.value)}
          />
        );
        break;
      case "number":
        input = (
          <input
            type="number"
            min="1"
            max="100"
            className={`${inputClass} w-24`}
            value={val}
            onChange={(e) => setField(field.key, e.target.value)}
          />
        );
        break;
      case "select":
        input = (
          <select className={inputClass} value={val} onChange={(e) => setField(field.key, e.target.value)}>
            <option value="">Select…</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
        break;
      case "radio":
        input = (
          <div className="space-y-2">
            {field.options?.map((o) => (
              <label key={o.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.key}
                  value={o.value}
                  checked={val === o.value}
                  onChange={() => setField(field.key, o.value)}
                  className="mt-0.5 accent-indigo-600"
                />
                <span className="text-sm text-slate-700">{o.label}</span>
              </label>
            ))}
          </div>
        );
        break;
      default:
        input = (
          <input
            type="text"
            className={inputClass}
            placeholder={field.placeholder}
            value={val}
            onChange={(e) => setField(field.key, e.target.value)}
          />
        );
    }

    return (
      <FieldWrap key={field.key} label={field.label} hint={field.hint}>
        {input}
      </FieldWrap>
    );
  }

  const supplementField = config.isSupplementDoc ? config.fields.find((f) => f.key === "parentAgreementName") : null;
  const regularFields = config.fields.filter((f) => f.key !== "parentAgreementName");

  return (
    <div className="space-y-8">
      {supplementField && (
        <section>
          <SectionHeading>Parent Agreement</SectionHeading>
          {renderField(supplementField)}
        </section>
      )}
      <section>
        <SectionHeading>Agreement Details</SectionHeading>
        {regularFields.map((f) => renderField(f))}
      </section>
      {config.coverPage.showSignatures && state.partyA && state.partyB && (
        <section>
          <SectionHeading>Signatories</SectionHeading>
          <div className="space-y-6">
            <PartyFields
              label={config.coverPage.partyALabel}
              value={state.partyA}
              onChange={(v) => onChange({ ...state, partyA: v })}
            />
            <div className="border-t border-slate-100 pt-6">
              <PartyFields
                label={config.coverPage.partyBLabel}
                value={state.partyB}
                onChange={(v) => onChange({ ...state, partyB: v })}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
