import { buildStandardTerms } from "@/app/lib/nda-template";
import { baseData } from "../fixtures/nda";

describe("buildStandardTerms", () => {
  describe("placeholder replacement", () => {
    it("replaces all coverpage_link spans with field-value spans", () => {
      const result = buildStandardTerms(baseData);
      expect(result).not.toContain('class="coverpage_link"');
      expect(result).toContain('class="field-value"');
    });

    it("injects Purpose in all three occurrences (clauses 1, 2a, 2b)", () => {
      const result = buildStandardTerms(baseData);
      const matches = result.match(/<span class="field-value">Evaluating a partnership\.<\/span>/g);
      expect(matches).toHaveLength(3);
    });

    it("injects Effective Date once", () => {
      const result = buildStandardTerms(baseData);
      expect(result).toContain(`<span class="field-value">2025-06-15</span>`);
    });

    it("injects Governing Law in both occurrences (clause 9)", () => {
      const result = buildStandardTerms(baseData);
      const matches = result.match(/<span class="field-value">California<\/span>/g);
      expect(matches).toHaveLength(2);
    });

    it("injects Jurisdiction in both occurrences (clause 9)", () => {
      const result = buildStandardTerms(baseData);
      const matches = result.match(/<span class="field-value">San Francisco, California<\/span>/g);
      expect(matches).toHaveLength(2);
    });
  });

  describe("MNDA Term branching", () => {
    it("produces 'N years from Effective Date' when mndaTermType is expires", () => {
      const result = buildStandardTerms({ ...baseData, mndaTermYears: "2" });
      expect(result).toContain("2 years from Effective Date");
    });

    it("pluralises correctly: 1 year (singular)", () => {
      const result = buildStandardTerms({ ...baseData, mndaTermYears: "1" });
      expect(result).toContain("1 year from Effective Date");
      expect(result).not.toContain("1 years");
    });

    it("pluralises correctly: 5 years (plural)", () => {
      const result = buildStandardTerms({ ...baseData, mndaTermYears: "5" });
      expect(result).toContain("5 years from Effective Date");
    });

    it("produces until-terminated text when mndaTermType is until-terminated", () => {
      const result = buildStandardTerms({ ...baseData, mndaTermType: "until-terminated" });
      expect(result).toContain("until terminated in accordance with the terms of the MNDA");
    });
  });

  describe("Confidentiality Term branching", () => {
    it("produces 'N years from Effective Date' when confidentialityTermType is fixed", () => {
      const result = buildStandardTerms({ ...baseData, confidentialityTermYears: "3" });
      expect(result).toContain("3 years from Effective Date");
    });

    it("produces 'in perpetuity' when confidentialityTermType is perpetual", () => {
      const result = buildStandardTerms({ ...baseData, confidentialityTermType: "perpetual" });
      expect(result).toContain("in perpetuity");
    });

    it("pluralises confidentiality term: 1 year singular", () => {
      const result = buildStandardTerms({ ...baseData, confidentialityTermYears: "1" });
      expect(result).toContain("1 year from Effective Date");
    });
  });

  describe("empty field fallbacks", () => {
    it("uses [Purpose] placeholder when purpose is empty", () => {
      const result = buildStandardTerms({ ...baseData, purpose: "" });
      expect(result).toContain('<span class="field-value">[Purpose]</span>');
    });

    it("uses [Effective Date] placeholder when effectiveDate is empty", () => {
      const result = buildStandardTerms({ ...baseData, effectiveDate: "" });
      expect(result).toContain('<span class="field-value">[Effective Date]</span>');
    });

    it("uses [Governing Law] placeholder when governingLaw is empty", () => {
      const result = buildStandardTerms({ ...baseData, governingLaw: "" });
      expect(result).toContain('<span class="field-value">[Governing Law]</span>');
    });

    it("uses [Jurisdiction] placeholder when jurisdiction is empty", () => {
      const result = buildStandardTerms({ ...baseData, jurisdiction: "" });
      expect(result).toContain('<span class="field-value">[Jurisdiction]</span>');
    });

    it("documents known bug: empty mndaTermYears produces malformed term string", () => {
      const result = buildStandardTerms({ ...baseData, mndaTermYears: "" });
      // Empty string → NaN !== 1 → plural suffix → " years from Effective Date" (missing number)
      // CoverPage guards with Math.max(1,...) but buildStandardTerms does not
      expect(result).toContain(" years from Effective Date");
    });
  });

  describe("output structure", () => {
    it("retains the Standard Terms heading", () => {
      const result = buildStandardTerms(baseData);
      expect(result).toContain("# Standard Terms");
    });

    it("retains the CC BY 4.0 footer", () => {
      const result = buildStandardTerms(baseData);
      expect(result).toContain("CC BY 4.0");
    });

    it("returns a non-empty string", () => {
      const result = buildStandardTerms(baseData);
      expect(result.length).toBeGreaterThan(100);
    });
  });
});
