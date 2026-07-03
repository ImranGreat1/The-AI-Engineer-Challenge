import type { ChatMessage } from "../lib/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`animate-fade-up flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        aria-hidden
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          isUser
            ? "bg-indigo-500 text-white"
            : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
        }`}
      >
        {isUser ? "You" : "MC"}
      </div>

      <div
        className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-[15px] leading-7 shadow-lg ${
          isUser
            ? "rounded-tr-md bg-indigo-500 text-white"
            : "rounded-tl-md border border-slate-700/80 bg-slate-900/90 text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="animate-fade-up flex gap-3">
      <div
        aria-hidden
        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-sm font-semibold text-emerald-300"
      >
        MC
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-700/80 bg-slate-900/90 px-4 py-4">
        <span className="typing-dot h-2 w-2 rounded-full bg-emerald-300" />
        <span className="typing-dot h-2 w-2 rounded-full bg-emerald-300" />
        <span className="typing-dot h-2 w-2 rounded-full bg-emerald-300" />
      </div>
    </div>
  );
}
