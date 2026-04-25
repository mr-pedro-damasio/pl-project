import React from "react";
import { render, screen } from "@testing-library/react";
import NDAPreview from "@/app/components/NDAPreview";
import { baseData } from "../fixtures/nda";

const emptyParty = { name: "", title: "", company: "", noticeAddress: "", date: "" };

describe("NDAPreview", () => {
  describe("CoverPage rendering", () => {
    it("renders the MNDA document heading", () => {
      render(<NDAPreview data={baseData} />);
      expect(screen.getByRole("heading", { name: /Mutual Non-Disclosure Agreement/i })).toBeInTheDocument();
    });

    it("shows filled Purpose as field-value", () => {
      const { container } = render(<NDAPreview data={baseData} />);
      const fieldValues = container.querySelectorAll(".field-value");
      const match = Array.from(fieldValues).find(el => el.textContent === "Evaluating a partnership.");
      expect(match).toBeInTheDocument();
    });

    it("shows empty Purpose as field-placeholder with the default fallback sentence", () => {
      const { container } = render(<NDAPreview data={{ ...baseData, purpose: "" }} />);
      const placeholders = container.querySelectorAll(".field-placeholder");
      const match = Array.from(placeholders).find(
        el => el.textContent === "Evaluating whether to enter into a business relationship with the other party."
      );
      expect(match).toBeInTheDocument();
    });

    it("shows empty governingLaw as field-placeholder with [State]", () => {
      const { container } = render(<NDAPreview data={{ ...baseData, governingLaw: "" }} />);
      const placeholders = container.querySelectorAll(".field-placeholder");
      const match = Array.from(placeholders).find(el => el.textContent === "[State]");
      expect(match).toBeInTheDocument();
    });

    it("shows filled governingLaw as field-value", () => {
      const { container } = render(<NDAPreview data={baseData} />);
      const fieldValues = container.querySelectorAll(".field-value");
      const match = Array.from(fieldValues).find(el => el.textContent === "California");
      expect(match).toBeInTheDocument();
    });

    it("shows empty jurisdiction as field-placeholder with [City/County, State]", () => {
      const { container } = render(<NDAPreview data={{ ...baseData, jurisdiction: "" }} />);
      const placeholders = container.querySelectorAll(".field-placeholder");
      const match = Array.from(placeholders).find(el => el.textContent === "[City/County, State]");
      expect(match).toBeInTheDocument();
    });

    describe("MNDA Term display", () => {
      it("shows '2 years from Effective Date' when mndaTermType is expires and years is 2", () => {
        render(<NDAPreview data={{ ...baseData, mndaTermYears: "2" }} />);
        expect(screen.getByText("2 years from Effective Date")).toBeInTheDocument();
      });

      it("shows '1 year from Effective Date' (singular) when years is 1", () => {
        render(<NDAPreview data={{ ...baseData, mndaTermYears: "1" }} />);
        expect(screen.getByText("1 year from Effective Date")).toBeInTheDocument();
      });

      it("shows 'Until terminated' when mndaTermType is until-terminated", () => {
        render(<NDAPreview data={{ ...baseData, mndaTermType: "until-terminated" }} />);
        expect(screen.getByText("Until terminated")).toBeInTheDocument();
      });

      it("clamps years to minimum 1 when mndaTermYears is empty string", () => {
        render(<NDAPreview data={{ ...baseData, mndaTermYears: "" }} />);
        expect(screen.getByText("1 year from Effective Date")).toBeInTheDocument();
      });
    });

    describe("Confidentiality Term display", () => {
      it("shows '3 years from Effective Date' when confidentialityTermYears is 3", () => {
        render(<NDAPreview data={{ ...baseData, confidentialityTermYears: "3" }} />);
        expect(screen.getByText("3 years from Effective Date")).toBeInTheDocument();
      });

      it("shows 'In perpetuity' when confidentialityTermType is perpetual", () => {
        render(<NDAPreview data={{ ...baseData, confidentialityTermType: "perpetual" }} />);
        expect(screen.getByText("In perpetuity")).toBeInTheDocument();
      });
    });

    describe("Effective Date display", () => {
      it("formats ISO date to US long-form date", () => {
        render(<NDAPreview data={baseData} />);
        // Date appears in cover page field-value and in signature blocks (multiple occurrences)
        const matches = screen.getAllByText("June 15, 2025");
        expect(matches.length).toBeGreaterThan(0);
      });

      it("shows [Effective Date] placeholder when effectiveDate is empty", () => {
        const { container } = render(<NDAPreview data={{ ...baseData, effectiveDate: "" }} />);
        const placeholders = container.querySelectorAll(".field-placeholder");
        const match = Array.from(placeholders).find(el => el.textContent === "[Effective Date]");
        expect(match).toBeInTheDocument();
      });
    });

    describe("Signature block", () => {
      it("renders Party 1 and Party 2 labels", () => {
        render(<NDAPreview data={baseData} />);
        expect(screen.getByText("Party 1")).toBeInTheDocument();
        expect(screen.getByText("Party 2")).toBeInTheDocument();
      });

      it("displays party name and company in signature block", () => {
        render(<NDAPreview data={baseData} />);
        expect(screen.getByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText("Alpha Inc.")).toBeInTheDocument();
      });

      it("renders blank signature line (not a text value)", () => {
        const { container } = render(<NDAPreview data={{ ...baseData, party1: emptyParty, party2: emptyParty }} />);
        const signatureLines = container.querySelectorAll(".border-b");
        expect(signatureLines.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Standard Terms rendering", () => {
    it("renders the markdown content area", () => {
      // ReactMarkdown is mocked to render <div data-testid="markdown-content">
      render(<NDAPreview data={baseData} />);
      expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    });

    it("passes built template string containing 'Standard Terms' heading to renderer", () => {
      render(<NDAPreview data={baseData} />);
      expect(screen.getByTestId("markdown-content").textContent).toContain("# Standard Terms");
    });

    it("injects purpose value into standard terms content", () => {
      render(<NDAPreview data={baseData} />);
      expect(screen.getByTestId("markdown-content").textContent).toContain("Evaluating a partnership.");
    });
  });
});
