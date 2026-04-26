import { buildDefaultState, mergeState } from "@/app/lib/state-utils";
import { mutualNdaConfig } from "@/app/lib/doc-configs/mutual-nda";
import { pilotConfig } from "@/app/lib/doc-configs/pilot";
import { DocumentState, GenericFieldPatch } from "@/app/lib/doc-configs/types";

describe("buildDefaultState", () => {
  it("initialises fields from config defaults", () => {
    const state = buildDefaultState(mutualNdaConfig);
    expect(state.fields.purpose).toBe(
      "Evaluating whether to enter into a business relationship with the other party."
    );
    expect(state.fields.mndaTermType).toBe("expires");
    expect(state.fields.mndaTermYears).toBe("1");
  });

  it("populates partyA and partyB for docs with signatures", () => {
    const state = buildDefaultState(mutualNdaConfig);
    expect(state.partyA).toBeDefined();
    expect(state.partyB).toBeDefined();
    expect(state.partyA!.name).toBe("");
  });

  it("sets today as effectiveDate default", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const today = new Date().toISOString().split("T")[0];
    expect(state.fields.effectiveDate).toBe(today);
  });

  it("initialises pilot config with correct defaults", () => {
    const state = buildDefaultState(pilotConfig);
    expect(state.partyA).toBeDefined();
    expect(state.partyB).toBeDefined();
    expect(state.fields.pilotPeriod).toBe("");
  });
});

describe("mergeState", () => {
  it("merges field values into state", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const patch: GenericFieldPatch = { fields: { governingLaw: "Delaware" } };
    const next = mergeState(state, patch);
    expect(next.fields.governingLaw).toBe("Delaware");
  });

  it("preserves existing fields not in patch", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const patch: GenericFieldPatch = { fields: { governingLaw: "Delaware" } };
    const next = mergeState(state, patch);
    expect(next.fields.mndaTermType).toBe("expires");
    expect(next.fields.purpose).toBe(state.fields.purpose);
  });

  it("skips null values in patch", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const patch: GenericFieldPatch = { fields: { governingLaw: null as unknown as string } };
    const next = mergeState(state, patch);
    expect(next.fields.governingLaw).toBe("");
  });

  it("deep-merges partyA fields", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const patch: GenericFieldPatch = { partyA: { name: "Jane Smith", company: "Acme" } };
    const next = mergeState(state, patch);
    expect(next.partyA!.name).toBe("Jane Smith");
    expect(next.partyA!.company).toBe("Acme");
    expect(next.partyA!.title).toBe(""); // preserved from original
  });

  it("preserves partyB when patch only updates partyA", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const withPartyB: DocumentState = {
      ...state,
      partyB: { ...state.partyB!, name: "Bob Jones" },
    };
    const patch: GenericFieldPatch = { partyA: { name: "Jane" } };
    const next = mergeState(withPartyB, patch);
    expect(next.partyB!.name).toBe("Bob Jones");
  });
});
