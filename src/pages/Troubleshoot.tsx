import { useState, useRef, useEffect } from "react";
import { Bot, Send, AlertTriangle, Wrench, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/troubleshoot`;

const quickPrompts = [
  { label: "TM-07", desc: "Traction Motor Overheating", prompt: "Fault code TM-07 on WAP7 — Traction Motor overheating. What should I do?" },
  { label: "EOP-12", desc: "Engine Oil Pressure Low", prompt: "Fault code EOP-12 on WDG4 — Engine oil pressure low warning. Steps to resolve?" },
  { label: "CP-03", desc: "Compressor Not Loading", prompt: "WAG9 compressor not loading, MR pressure not building. Code CP-03." },
  { label: "Brake Fail", desc: "Emergency", prompt: "Emergency: Complete brake failure on WAP7 in mid-section. What immediate actions should I take?" },
];

export default function Troubleshoot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: userMessages }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "AI service error" }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try { const parsed = JSON.parse(jsonStr); const content = parsed.choices?.[0]?.delta?.content; if (content) upsert(content); } catch {}
        }
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ Error: ${e.message}. Please try again.` }]);
    } finally { setIsLoading(false); }
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Msg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-railway-orange/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-railway-orange" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t("troubleshoot.title")}</h2>
            <p className="text-[11px] text-muted-foreground">{t("troubleshoot.subtitle")}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="railway-gradient rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-railway-orange" />
                <span className="text-sm font-semibold text-primary-foreground">{t("troubleshoot.quickTitle")}</span>
              </div>
              <p className="text-primary-foreground/70 text-xs">{t("troubleshoot.quickDesc")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((qp) => (
                <button key={qp.label} onClick={() => handleSend(qp.prompt)} className="stat-card p-3 text-left group">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-3.5 w-3.5 text-railway-orange" />
                    <span className="text-xs font-bold text-foreground">{qp.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{qp.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-foreground pt-2">{t("troubleshoot.hint")}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_ol]:pl-4 [&_ul]:pl-4">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : <p>{msg.content}</p>}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("troubleshoot.placeholder")} disabled={isLoading}
            className="flex-1 h-11 px-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" />
          <button type="submit" disabled={isLoading || !input.trim()} className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-colors shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
