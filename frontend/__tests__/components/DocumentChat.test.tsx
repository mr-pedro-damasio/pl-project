import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentChat from "@/app/components/DocumentChat";
import { apiFetch } from "@/app/lib/auth";

jest.mock("@/app/lib/auth", () => ({
  apiFetch: jest.fn(),
  getToken: jest.fn(() => "mock-token"),
  setToken: jest.fn(),
  clearToken: jest.fn(),
  isAuthenticated: jest.fn(() => true),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

function mockOk(reply: string, patch: Record<string, unknown> = {}) {
  mockApiFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ reply, patch }),
  } as Response);
}

describe("DocumentChat", () => {
  const onFieldsExtracted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fires greeting on mount and shows assistant reply", async () => {
    mockOk("Hello! What kind of agreement do you need?");
    render(<DocumentChat docTypeId="mutual-nda" onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() =>
      expect(screen.getByText("Hello! What kind of agreement do you need?")).toBeInTheDocument()
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/chat/mutual-nda",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("calls the correct endpoint for the given doc type", async () => {
    mockOk("Hello for CSA!");
    render(<DocumentChat docTypeId="csa" onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => expect(screen.getByText("Hello for CSA!")).toBeInTheDocument());
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/chat/csa",
      expect.anything()
    );
  });

  it("calls onFieldsExtracted with non-empty patch", async () => {
    mockOk("Hello!");
    render(<DocumentChat docTypeId="mutual-nda" onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockOk("Delaware noted.", { fields: { governingLaw: "Delaware" } });
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: "Use Delaware law" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(onFieldsExtracted).toHaveBeenCalledWith({ fields: { governingLaw: "Delaware" } })
    );
  });

  it("shows error banner on server error", async () => {
    mockOk("Hello!");
    render(<DocumentChat docTypeId="mutual-nda" onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiFetch.mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) } as Response);
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
  });

  it("sends on Enter key", async () => {
    mockOk("Hello!");
    render(<DocumentChat docTypeId="mutual-nda" onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockOk("Got it!");
    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "hi" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => expect(screen.getByText("hi")).toBeInTheDocument());
  });
});
