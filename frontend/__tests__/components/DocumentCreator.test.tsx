import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DocumentCreator from "@/app/components/DocumentCreator";
import { mutualNdaConfig } from "@/app/lib/doc-configs/mutual-nda";
import { csaConfig } from "@/app/lib/doc-configs/csa";
import { GenericFieldPatch } from "@/app/lib/doc-configs/types";

// Mock child components to isolate DocumentCreator
jest.mock("@/app/components/GenericDocumentPreview", () => ({
  __esModule: true,
  default: function MockPreview({ state }: { state: { fields: Record<string, string> } }) {
    return (
      <div data-testid="doc-preview">
        <span data-testid="preview-governing-law">{state.fields.governingLaw}</span>
        <span data-testid="preview-purpose">{state.fields.purpose}</span>
      </div>
    );
  },
}));

jest.mock("@/app/components/GenericDocumentForm", () => ({
  __esModule: true,
  default: function MockForm({ state, onChange }: { state: { fields: Record<string, string> }; onChange: (s: unknown) => void }) {
    return (
      <div data-testid="doc-form">
        <input
          data-testid="governing-law-input"
          value={state.fields.governingLaw ?? ""}
          onChange={(e) =>
            onChange({ ...state, fields: { ...state.fields, governingLaw: e.target.value } })
          }
        />
      </div>
    );
  },
}));

let capturedOnFieldsExtracted: ((patch: GenericFieldPatch) => void) | null = null;
jest.mock("@/app/components/DocumentChat", () => ({
  __esModule: true,
  default: function MockChat({ onFieldsExtracted }: { onFieldsExtracted: (p: GenericFieldPatch) => void }) {
    capturedOnFieldsExtracted = onFieldsExtracted;
    return <div data-testid="doc-chat">AI Chat</div>;
  },
}));

describe("DocumentCreator", () => {
  beforeEach(() => {
    capturedOnFieldsExtracted = null;
  });

  it("renders the document name in the header", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    expect(screen.getByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
  });

  it("defaults to the Chat tab", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    expect(screen.getByTestId("doc-chat")).toBeInTheDocument();
    expect(screen.getByTestId("doc-form")).toBeInTheDocument(); // CSS-hidden but mounted
  });

  it("renders AI Chat and Form tab buttons", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    expect(screen.getByRole("button", { name: /AI Chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Form/i })).toBeInTheDocument();
  });

  it("renders the document preview", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    expect(screen.getByTestId("doc-preview")).toBeInTheDocument();
  });

  it("initialises with correct default purpose for NDA", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    expect(screen.getByTestId("preview-purpose").textContent).toBe(
      "Evaluating whether to enter into a business relationship with the other party."
    );
  });

  it("updates preview when form field changes", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    fireEvent.click(screen.getByRole("button", { name: /Form/i }));
    fireEvent.change(screen.getByTestId("governing-law-input"), {
      target: { value: "Delaware" },
    });
    expect(screen.getByTestId("preview-governing-law").textContent).toBe("Delaware");
  });

  it("merges AI patch into state and updates preview", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    act(() => {
      capturedOnFieldsExtracted!({ fields: { governingLaw: "California" } });
    });
    expect(screen.getByTestId("preview-governing-law").textContent).toBe("California");
  });

  it("preserves existing fields when AI patch is partial", () => {
    render(<DocumentCreator config={mutualNdaConfig} />);
    act(() => {
      capturedOnFieldsExtracted!({ fields: { governingLaw: "Delaware" } });
    });
    // purpose should still have its default
    expect(screen.getByTestId("preview-purpose").textContent).toBe(
      "Evaluating whether to enter into a business relationship with the other party."
    );
  });

  it("renders CSA config with correct document name", () => {
    render(<DocumentCreator config={csaConfig} />);
    expect(screen.getByText("Cloud Service Agreement")).toBeInTheDocument();
  });

  it("calls window.print when Download PDF is clicked", () => {
    const mockPrint = jest.fn();
    Object.defineProperty(window, "print", { value: mockPrint, writable: true });
    render(<DocumentCreator config={mutualNdaConfig} />);
    fireEvent.click(screen.getByRole("button", { name: /Download PDF/i }));
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });
});
