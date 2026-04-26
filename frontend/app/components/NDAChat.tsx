"use client";

import { useState, useEffect, useRef } from "react";
import { NDAFieldPatch } from "@/app/lib/types";
import { apiFetch } from "@/app/lib/auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  onFieldsExtracted: (patch: NDAFieldPatch) => void;
}

export default function NDAChat({ onFieldsExtracted }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasGreeted = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync with state so async callbacks always read current history
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  async function sendMessage(userText: string) {
    if (loading) return;
    setLoading(true);
    setError(null);

    const snapshot = messagesRef.current;
    const apiMessages = userText
      ? [...snapshot, { role: "user" as const, content: userText }]
      : snapshot;

    if (userText) setMessages(apiMessages);

    try {
      const res = await apiFetch("/api/chat/nda", {
        method: "POST",
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setMessages([...apiMessages, { role: "assistant" as const, content: json.reply }]);
      if (json.patch && Object.keys(json.patch).length > 0) {
        onFieldsExtracted(json.patch);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      if (userText) setMessages(snapshot);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      sendMessage("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = input.trim();
      if (text && !loading) {
        setInput("");
        sendMessage(text);
      }
    }
  }

  function handleSend() {
    const text = input.trim();
    if (text && !loading) {
      setInput("");
      sendMessage(text);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white rounded-tr-sm"
                  : "bg-slate-100 text-slate-800 rounded-tl-sm"
              }`}
              style={msg.role === "user" ? { backgroundColor: "#209dd7" } : undefined}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-400 hover:text-red-600 font-medium"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="border-t border-slate-200 pt-3 flex gap-2 items-end">
        <textarea
          rows={2}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition resize-none"
          placeholder="Type your message… (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40 transition active:scale-95"
          style={{ backgroundColor: "#753991" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
