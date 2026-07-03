"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { createMessage, streamChatReply, type ChatMessage } from "../lib/chat";

const STARTER_PROMPTS = [
  "I'm feeling overwhelmed today. Can you help me reset?",
  "How do I build a simple morning routine?",
  "I keep procrastinating on an important task.",
];

export function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function sendMessage(rawMessage: string) {
    const trimmed = rawMessage.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput("");
    setIsLoading(true);

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("assistant", "");
    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      await streamChatReply(
        trimmed,
        (chunk) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: message.content + chunk }
                : message,
            ),
          );
        },
        abortRef.current.signal,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      const detail =
        err instanceof Error ? err.message : "Unable to reach the coach.";
      setError(detail);
      setMessages((prev) =>
        prev.filter((message) => message.id !== assistantMessage.id),
      );
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 text-center sm:mb-8">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
          Mindful Coach
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          A calm space to think, breathe, and move forward
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-300">
          Ask for support with stress, motivation, habits, or confidence. Your
          messages stream live from the FastAPI chat endpoint.
        </p>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-700/60 bg-slate-950/55 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-6 text-center">
              <div className="max-w-md space-y-3">
                <h2 className="text-xl font-medium text-white">
                  What would you like to work through today?
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  Start with a feeling, a goal, or a habit you want to change.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-left text-sm text-slate-200 transition hover:border-emerald-400/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) =>
              message.role === "assistant" &&
              isLoading &&
              message.content.length === 0 ? (
                <TypingIndicator key={message.id} />
              ) : (
                <MessageBubble key={message.id} message={message} />
              ),
            )
          )}
        </div>

        <div className="border-t border-slate-800/90 bg-slate-950/70 px-4 py-4 sm:px-6">
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="chat-input" className="sr-only">
              Message the coach
            </label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              rows={3}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-[15px] leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Press Enter to send, Shift+Enter for a new line.
              </p>
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isLoading ? "Coach is replying..." : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
