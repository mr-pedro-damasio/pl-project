import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import NDACreator from "@/app/components/NDACreator";
import type { NDAFormData, NDAFieldPatch } from "@/app/lib/types";

// Mock NDAPreview to isolate NDACreator state management
jest.mock("@/app/components/NDAPreview", () => {
  return function MockNDAPreview({ data }: { data: NDAFormData }) {
    return (
      <div data-testid="nda-preview">
        <span data-testid="preview-purpose">{data.purpose}</span>
        <span data-testid="preview-mnda-term-type">{data.mndaTermType}</span>
        <span data-testid="preview-governing-law">{data.governingLaw}</span>
        <span data-testid="preview-party1-company">{data.party1.company}</span>
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

// Mock NDAChat to prevent real API calls and expose onFieldsExtracted
let capturedOnFieldsExtracted: ((patch: NDAFieldPatch) => void) | null = null;
jest.mock("@/app/components/NDAChat", () => ({
  __esModule: true,
  default: function MockNDAChat({ onFieldsExtracted }: { onFieldsExtracted: (patch: NDAFieldPatch) => void }) {
    capturedOnFieldsExtracted = onFieldsExtracted;
    return <div data-testid="nda-chat">AI Chat</div>;
  },
}));

describe("NDACreator", () => {
  beforeEach(() => {
    capturedOnFieldsExtracted = null;
  });

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

    it("renders chat and form tabs", () => {
      render(<NDACreator />);
      expect(screen.getByRole("button", { name: /AI Chat/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Form/i })).toBeInTheDocument();
    });

    it("defaults to the Chat tab", () => {
      render(<NDACreator />);
      expect(screen.getByTestId("nda-chat")).toBeInTheDocument();
    });
  });

  describe("tab switching", () => {
    it("switches to the Form tab when clicked", () => {
      render(<NDACreator />);
      fireEvent.click(screen.getByRole("button", { name: /Form/i }));
      const formPanel = screen.getByTestId("nda-form").closest("div");
      expect(formPanel?.className).not.toContain("hidden");
    });

    it("switches back to Chat tab when clicked", () => {
      render(<NDACreator />);
      fireEvent.click(screen.getByRole("button", { name: /Form/i }));
      fireEvent.click(screen.getByRole("button", { name: /AI Chat/i }));
      const chatPanel = screen.getByTestId("nda-chat").closest("div");
      expect(chatPanel?.className).not.toContain("hidden");
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
    it("updates the preview when the form changes the purpose", () => {
      render(<NDACreator />);
      fireEvent.change(screen.getByTestId("purpose-input"), { target: { value: "New purpose text" } });
      expect(screen.getByTestId("preview-purpose").textContent).toBe("New purpose text");
      expect(screen.getByTestId("preview-mnda-term-type").textContent).toBe("expires");
    });
  });

  describe("AI field extraction", () => {
    it("merges extracted top-level fields into the preview", () => {
      render(<NDACreator />);
      act(() => { capturedOnFieldsExtracted!({ governingLaw: "Delaware" }); });
      expect(screen.getByTestId("preview-governing-law").textContent).toBe("Delaware");
    });

    it("deep-merges party1 fields without overwriting other party1 data", () => {
      render(<NDACreator />);
      act(() => { capturedOnFieldsExtracted!({ party1: { company: "Acme Corp" } }); });
      expect(screen.getByTestId("preview-party1-company").textContent).toBe("Acme Corp");
    });

    it("preserves existing fields when patch only updates one field", () => {
      render(<NDACreator />);
      act(() => { capturedOnFieldsExtracted!({ governingLaw: "Delaware" }); });
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
