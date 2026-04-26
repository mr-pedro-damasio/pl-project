import { DocTypeConfig, DocumentState, GenericFieldPatch, PartyData } from "./doc-configs/types";

const EMPTY_PARTY: PartyData = { name: "", title: "", company: "", noticeAddress: "", date: "" };

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function buildDefaultState(config: DocTypeConfig): DocumentState {
  const fields: Record<string, string> = {};
  for (const f of config.fields) {
    fields[f.key] = f.defaultValue ?? (f.type === "date" ? today() : "");
  }
  const state: DocumentState = { fields };
  if (config.coverPage.showSignatures) {
    state.partyA = { ...EMPTY_PARTY, date: today() };
    state.partyB = { ...EMPTY_PARTY, date: today() };
  }
  return state;
}

function mergeParty(prev: PartyData | undefined, patch: Partial<PartyData> | undefined): PartyData | undefined {
  if (!patch) return prev;
  return { ...(prev ?? EMPTY_PARTY), ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v != null)) };
}

export function mergeState(prev: DocumentState, patch: GenericFieldPatch): DocumentState {
  const fields = { ...prev.fields };
  if (patch.fields) {
    for (const [k, v] of Object.entries(patch.fields)) {
      if (v != null) fields[k] = v;
    }
  }
  return {
    fields,
    partyA: mergeParty(prev.partyA, patch.partyA),
    partyB: mergeParty(prev.partyB, patch.partyB),
  };
}
