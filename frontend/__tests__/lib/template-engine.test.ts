import { substituteTemplate, buildTemplateValues } from "@/app/lib/template-engine";
import { mutualNdaConfig } from "@/app/lib/doc-configs/mutual-nda";
import { buildDefaultState } from "@/app/lib/state-utils";

describe("substituteTemplate", () => {
  it("substitutes coverpage_link spans with field values", () => {
    const template = `<span class="coverpage_link">Effective Date</span>`;
    const result = substituteTemplate(template, { "Effective Date": "January 1, 2026" });
    expect(result).toContain('<span class="field-value">January 1, 2026</span>');
    expect(result).not.toContain("coverpage_link");
  });

  it("substitutes keyterms_link spans", () => {
    const template = `<span class="keyterms_link">Governing Law</span>`;
    const result = substituteTemplate(template, { "Governing Law": "Delaware" });
    expect(result).toContain('<span class="field-value">Delaware</span>');
  });

  it("substitutes orderform_link spans", () => {
    const template = `<span class="orderform_link">Pilot Period</span>`;
    const result = substituteTemplate(template, { "Pilot Period": "90 days" });
    expect(result).toContain('<span class="field-value">90 days</span>');
  });

  it("substitutes businessterms_link spans", () => {
    const template = `<span class="businessterms_link">Obligations</span>`;
    const result = substituteTemplate(template, { "Obligations": "Refer customers" });
    expect(result).toContain('<span class="field-value">Refer customers</span>');
  });

  it("uses placeholder when no value provided", () => {
    const template = `<span class="coverpage_link">Missing Field</span>`;
    const result = substituteTemplate(template, {});
    expect(result).toContain('<span class="field-placeholder">[Missing Field]</span>');
  });

  it("strips header_N span wrappers", () => {
    const template = `<span class="header_2">Section Title</span>`;
    const result = substituteTemplate(template, {});
    expect(result).toBe("Section Title");
    expect(result).not.toContain("<span");
  });

  it("handles multiple markers in one template", () => {
    const template = `<span class="coverpage_link">A</span> and <span class="keyterms_link">B</span>`;
    const result = substituteTemplate(template, { A: "Alpha", B: "Beta" });
    expect(result).toContain("Alpha");
    expect(result).toContain("Beta");
  });

  it("leaves text unchanged when marker appears multiple times", () => {
    const template = `<span class="coverpage_link">Purpose</span> — <span class="coverpage_link">Purpose</span>`;
    const result = substituteTemplate(template, { Purpose: "Testing" });
    expect(result.match(/field-value/g)?.length).toBe(2);
  });
});

describe("buildTemplateValues", () => {
  it("maps templateMarker fields from state", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const stateWithValues = {
      ...state,
      fields: { ...state.fields, governingLaw: "Delaware", jurisdiction: "Wilmington, DE" },
    };
    const values = buildTemplateValues(mutualNdaConfig.fields, stateWithValues);
    expect(values["Governing Law"]).toBe("Delaware");
    expect(values["Jurisdiction"]).toBe("Wilmington, DE");
  });

  it("skips fields with no templateMarker", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const stateWithValues = {
      ...state,
      fields: { ...state.fields, mndaTermYears: "3" },
    };
    const values = buildTemplateValues(mutualNdaConfig.fields, stateWithValues);
    // mndaTermYears has no templateMarker — it's a sub-field
    expect(Object.keys(values)).not.toContain("mndaTermYears");
  });

  it("applies computedTemplateValues override", () => {
    const state = buildDefaultState(mutualNdaConfig);
    const stateWithValues = {
      ...state,
      fields: { ...state.fields, mndaTermType: "until-terminated" },
    };
    const values = buildTemplateValues(
      mutualNdaConfig.fields,
      stateWithValues,
      mutualNdaConfig.computedTemplateValues
    );
    expect(values["MNDA Term"]).toBe("until terminated in accordance with the terms of the MNDA");
  });
});
