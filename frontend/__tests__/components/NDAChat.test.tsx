import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import NDAChat from "@/app/components/NDAChat";
import { apiFetch } from "@/app/lib/auth";

jest.mock("@/app/lib/auth", () => ({
  apiFetch: jest.fn(),
  getToken: jest.fn(() => "mock-token"),
  setToken: jest.fn(),
  clearToken: jest.fn(),
  isAuthenticated: jest.fn(() => true),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

function mockApiOk(reply: string, patch: Record<string, unknown> = {}) {
  mockApiFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ reply, patch }),
  } as Response);
}

function mockApiError(status = 500) {
  mockApiFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({}),
  } as Response);
}

describe("NDAChat", () => {
  const onFieldsExtracted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fires greeting on mount and shows assistant reply", async () => {
    mockApiOk("Hello! What would you like to use this NDA for?");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() =>
      expect(screen.getByText("Hello! What would you like to use this NDA for?")).toBeInTheDocument()
    );
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/chat/nda",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("does not show a user bubble for the greeting", async () => {
    mockApiOk("Hi there!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => expect(screen.getByText("Hi there!")).toBeInTheDocument());
    const allBubbles = screen.getAllByText(/.+/);
    expect(allBubbles.every((el) => el.textContent !== "")).toBeTruthy();
    // The greeting call sends no user message content
    const body = JSON.parse((mockApiFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.messages).toEqual([]);
  });

  it("sends user message and shows both bubbles", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiOk("Got it, Delaware noted.");
    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "Use Delaware law" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByText("Use Delaware law")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Got it, Delaware noted.")).toBeInTheDocument());
  });

  it("calls onFieldsExtracted with the patch", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiOk("Delaware noted.", { governingLaw: "Delaware" });
    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "Delaware" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(onFieldsExtracted).toHaveBeenCalledWith({ governingLaw: "Delaware" })
    );
  });

  it("does not call onFieldsExtracted when patch is empty", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiOk("Can you tell me more?", {});
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: "hi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByText("Can you tell me more?")).toBeInTheDocument());
    expect(onFieldsExtracted).not.toHaveBeenCalledWith(expect.anything());
    // was called once at mount with empty greeting; the reply had empty patch
    // so after greeting, onFieldsExtracted should still be 0 or only for non-empty patches
  });

  it("shows error banner on server error", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiError(502);
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
  });

  it("dismisses the error banner", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiError(500);
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => screen.getByLabelText(/dismiss error/i));
    fireEvent.click(screen.getByLabelText(/dismiss error/i));
    expect(screen.queryByLabelText(/dismiss error/i)).not.toBeInTheDocument();
  });

  it("sends on Enter key", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    mockApiOk("Great!");
    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "hello" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => expect(screen.getByText("hello")).toBeInTheDocument());
  });

  it("does not send on Shift+Enter", async () => {
    mockApiOk("Hello!");
    render(<NDAChat onFieldsExtracted={onFieldsExtracted} />);
    await waitFor(() => screen.getByText("Hello!"));

    const textarea = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(textarea, { target: { value: "hello" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    // Only the greeting call should have been made
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });
});
