import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NDACreator from "@/app/components/NDACreator";
import type { NDAFormData } from "@/app/lib/types";

// Mock NDAPreview to isolate NDACreator state management
jest.mock("@/app/components/NDAPreview", () => {
  return function MockNDAPreview({ data }: { data: NDAFormData }) {
    return (
      <div data-testid="nda-preview">
        <span data-testid="preview-purpose">{data.purpose}</span>
        <span data-testid="preview-mnda-term-type">{data.mndaTermType}</span>
        <span data-testid="preview-governing-law">{data.governingLaw}</span>
      </div>
    );
  };
});

// Mock NDAForm to expose controlled data easily
jest.mock("@/app/components/NDAForm", () => {
  return function MockNDAForm({ data, onChange }: { data: NDAFormData; onChange: (d: NDAFormData) => void }) {
    return (
      <div data-testid="nda-form">
        <input
          data-testid="purpose-input"
          value={data.purpose}
          onChange={(e) => onChange({ ...data, purpose: e.target.value })}
        />
      </div>
    );
  };
});

describe("NDACreator", () => {
  describe("layout", () => {
    it("renders the Mutual NDA Creator header", () => {
      render(<NDACreator />);
      expect(screen.getByText("Mutual NDA Creator")).toBeInTheDocument();
    });

    it("renders the Download PDF button", () => {
      render(<NDACreator />);
      expect(screen.getByRole("button", { name: /Download PDF/i })).toBeInTheDocument();
    });

    it("renders both form and preview panels", () => {
      render(<NDACreator />);
      expect(screen.getByTestId("nda-form")).toBeInTheDocument();
      expect(screen.getByTestId("nda-preview")).toBeInTheDocument();
    });
  });

  describe("default state", () => {
    it("initialises with a pre-filled purpose", () => {
      render(<NDACreator />);
      expect((screen.getByTestId("purpose-input") as HTMLInputElement).value).toBe(
        "Evaluating whether to enter into a business relationship with the other party."
      );
    });

    it("passes initial purpose to preview", () => {
      render(<NDACreator />);
      expect(screen.getByTestId("preview-purpose").textContent).toBe(
        "Evaluating whether to enter into a business relationship with the other party."
      );
    });

    it("initialises mndaTermType as 'expires'", () => {
      render(<NDACreator />);
      expect(screen.getByTestId("preview-mnda-term-type").textContent).toBe("expires");
    });
  });

  describe("state reactivity", () => {
    it("updates the preview when the form changes the purpose while preserving other fields", () => {
      render(<NDACreator />);
      fireEvent.change(screen.getByTestId("purpose-input"), { target: { value: "New purpose text" } });
      // Purpose updated
      expect(screen.getByTestId("preview-purpose").textContent).toBe("New purpose text");
      // Other fields preserved — mndaTermType still "expires" (not undefined)
      expect(screen.getByTestId("preview-mnda-term-type").textContent).toBe("expires");
    });
  });

  describe("Download PDF button", () => {
    it("calls window.print when clicked", () => {
      const mockPrint = jest.fn();
      Object.defineProperty(window, "print", { value: mockPrint, writable: true });
      render(<NDACreator />);
      fireEvent.click(screen.getByRole("button", { name: /Download PDF/i }));
      expect(mockPrint).toHaveBeenCalledTimes(1);
    });
  });
});
