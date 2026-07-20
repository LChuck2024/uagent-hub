import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../types";
import { streamTenantChat } from "../lib/sseClient";
import { Markdown } from "./Markdown";
import { Send, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TenantChatProps {
  tenantSlug: string;
  siteTitle: string;
  welcomeMessage?: string;
}

export function TenantChat({ tenantSlug, siteTitle, welcomeMessage }: TenantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    const modelId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: modelId,
        role: "model",
        text: "",
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      const reply = await streamTenantChat(
        {
          tenantSlug,
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        },
        (partial) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === modelId ? { ...m, text: partial } : m)),
          );
        },
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, text: reply } : m)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请稍后再试。");
      setMessages((prev) => prev.filter((m) => m.id !== modelId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[420px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-stone-500 text-sm px-4 leading-relaxed">
            {welcomeMessage || `输入你的问题，${siteTitle} 即刻为你解答`}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-stone-100 border border-stone-300"
                    : "bg-orange-50 border border-orange-200"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-stone-600" />
                ) : (
                  <Bot className="w-4 h-4 text-orange-700" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-stone-100 border border-stone-300 text-stone-900"
                    : "bg-stone-100 border border-stone-200 text-stone-800"
                }`}
              >
                {msg.role === "model" ? (
                  msg.text ? (
                    <div className="prose-custom">
                      <Markdown content={msg.text} />
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-stone-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      思考中...
                    </span>
                  )
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-xs text-rose-400 mb-2 px-1">{error}</p>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end border-t border-stone-200 pt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="输入你的问题..."
          rows={2}
          disabled={isLoading}
          className="flex-1 resize-none bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-xl btn-primary text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
