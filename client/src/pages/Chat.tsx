import React from "react";
import { trpc } from "../trpc";
import type { UserSession } from "./Login";

type Message = { role: "user" | "assistant"; content: string; sources?: number };

const S = {
  root: { display: "flex", height: "100vh", background: "#0f172a", fontFamily: "inherit" } as React.CSSProperties,

  // Sidebar
  sidebar: {
    width: 280, background: "#1e293b", display: "flex", flexDirection: "column" as const,
    borderRight: "1px solid #334155",
  } as React.CSSProperties,
  sidebarHeader: {
    padding: "20px 16px 0",
    borderBottom: "1px solid #334155",
    paddingBottom: 16,
  } as React.CSSProperties,
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 } as React.CSSProperties,
  logoIcon: {
    width: 32, height: 32, background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
  } as React.CSSProperties,
  logoText: { fontWeight: 700, fontSize: 15, color: "#f1f5f9" } as React.CSSProperties,
  newChatBtn: {
    width: "100%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px",
    fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    justifyContent: "center",
  } as React.CSSProperties,

  sidebarSection: { padding: "16px 16px 8px" } as React.CSSProperties,
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 10 },

  uploadArea: (hovered: boolean) => ({
    borderWidth: 1.5, borderStyle: "dashed", borderColor: hovered ? "#6366f1" : "#334155",
    borderRadius: 10, padding: "14px 12px",
    display: "flex", alignItems: "center", gap: 10,
    cursor: "pointer", transition: "border-color .2s, background .2s",
    fontSize: 13, color: "#94a3b8",
    background: hovered ? "rgba(99,102,241,0.05)" : "transparent",
  }) as React.CSSProperties,

  statusText: { fontSize: 11, color: "#22c55e", padding: "6px 4px", lineHeight: 1.4 } as React.CSSProperties,
  statusError: { fontSize: 11, color: "#f87171", padding: "6px 4px", lineHeight: 1.4 } as React.CSSProperties,

  docItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "7px 4px", borderBottom: "1px solid #1e293b",
    fontSize: 12, color: "#94a3b8",
  } as React.CSSProperties,
  docDot: (status: string) => ({
    width: 7, height: 7, borderRadius: "50%",
    background: status === "ready" ? "#22c55e" : status === "failed" ? "#f87171" : "#f59e0b",
    flexShrink: 0,
  }) as React.CSSProperties,
  docName: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, flex: 1 },

  // User info
  userCard: {
    marginTop: "auto", padding: "14px 16px",
    borderTop: "1px solid #334155",
    display: "flex", alignItems: "center", gap: 10,
  } as React.CSSProperties,
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
  } as React.CSSProperties,
  userName: { fontWeight: 600, fontSize: 13, color: "#f1f5f9", lineHeight: 1.2 } as React.CSSProperties,
  userEmail: { fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 150 } as React.CSSProperties,
  logoutBtn: {
    marginLeft: "auto", background: "none", border: "none",
    color: "#64748b", cursor: "pointer", padding: 4, fontSize: 16, borderRadius: 6,
    transition: "color .2s",
  } as React.CSSProperties,

  // Main chat
  main: { flex: 1, display: "flex", flexDirection: "column" as const } as React.CSSProperties,
  chatHeader: {
    padding: "16px 24px", borderBottom: "1px solid #1e293b",
    display: "flex", alignItems: "center", gap: 10,
  } as React.CSSProperties,
  chatHeaderTitle: { fontWeight: 700, fontSize: 15, color: "#f1f5f9" } as React.CSSProperties,
  chatHeaderSub: { fontSize: 12, color: "#64748b" } as React.CSSProperties,
  statusDot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e" } as React.CSSProperties,

  messages: {
    flex: 1, overflowY: "auto" as const, padding: "32px 24px",
    display: "flex", flexDirection: "column" as const, gap: 20,
    className: "chat-surface",
  } as React.CSSProperties,

  emptyState: {
    margin: "auto", textAlign: "center" as const, color: "#475569",
    display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16,
  } as React.CSSProperties,
  emptyIcon: {
    width: 72, height: 72, background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
  } as React.CSSProperties,
  emptyTitle: { fontSize: 20, fontWeight: 700, color: "#94a3b8" } as React.CSSProperties,
  emptyText: { fontSize: 14, color: "#475569", maxWidth: 360, lineHeight: 1.6 } as React.CSSProperties,

  suggestions: { display: "flex", gap: 8, flexWrap: "wrap" as const, justifyContent: "center", marginTop: 4 },
  suggestionChip: {
    background: "#1e293b", border: "1px solid #334155",
    color: "#94a3b8", borderRadius: 8, padding: "8px 14px",
    fontSize: 12, cursor: "pointer", transition: "all .2s",
  } as React.CSSProperties,

  msgWrap: (isUser: boolean) => ({
    display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
    gap: 10, alignItems: "flex-end",
  }) as React.CSSProperties,
  msgAvatar: (isUser: boolean) => ({
    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
    background: isUser ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#1e293b",
    border: isUser ? "none" : "1px solid #334155",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
    marginBottom: 2,
  }) as React.CSSProperties,
  bubble: (isUser: boolean) => ({
    maxWidth: "72%", padding: "12px 16px",
    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    background: isUser ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#1e293b",
    color: "#f1f5f9", fontSize: 14, lineHeight: 1.65,
    whiteSpace: "pre-wrap" as const, border: isUser ? "none" : "1px solid #334155",
    boxShadow: isUser ? "0 2px 12px rgba(79,70,229,0.3)" : "none",
  }) as React.CSSProperties,
  sourcesBadge: {
    marginTop: 6, fontSize: 11, color: "#64748b",
    display: "flex", alignItems: "center", gap: 4,
  } as React.CSSProperties,

  typing: {
    display: "flex", gap: 4, alignItems: "center", padding: "12px 16px",
    background: "#1e293b", borderRadius: "18px 18px 18px 4px",
    border: "1px solid #334155", width: "fit-content",
  } as React.CSSProperties,
  typingDot: { width: 6, height: 6, borderRadius: "50%", background: "#64748b" } as React.CSSProperties,

  inputArea: {
    padding: "16px 24px 20px", borderTop: "1px solid #1e293b",
  } as React.CSSProperties,
  inputRow: {
    display: "flex", gap: 10, alignItems: "flex-end",
    background: "#1e293b", borderRadius: 16,
    padding: "10px 10px 10px 16px", border: "1.5px solid #334155",
    transition: "border-color .2s",
  } as React.CSSProperties,
  textarea: {
    flex: 1, background: "none", border: "none", outline: "none",
    color: "#f1f5f9", fontSize: 14, resize: "none" as const, lineHeight: 1.5,
    maxHeight: 120, minHeight: 24,
  } as React.CSSProperties,
  sendBtn: (enabled: boolean) => ({
    width: 38, height: 38, borderRadius: 10, border: "none",
    background: enabled ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#334155",
    color: enabled ? "#fff" : "#64748b",
    cursor: enabled ? "pointer" : "not-allowed",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, fontSize: 16, transition: "all .2s",
  }) as React.CSSProperties,
  hint: { fontSize: 11, color: "#475569", textAlign: "center" as const, marginTop: 8 },
};

const suggestions = [
  "O que diz o contrato sobre prazo de entrega?",
  "Quais são as cláusulas de rescisão?",
  "Resuma os pontos principais",
];

export function Chat({ user, onLogout }: { user: UserSession; onLogout: () => void }) {
  const sessionId = React.useMemo(() => {
    let id = localStorage.getItem("session_id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("session_id", id); }
    return id;
  }, []);

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [conversationId, setConversationId] = React.useState<string | undefined>();
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<{ text: string; ok: boolean } | null>(null);
  const [hoveredUpload, setHoveredUpload] = React.useState(false);
  const [inputFocused, setInputFocused] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const sendMessage = trpc.chat.sendMessage.useMutation();
  const uploadDocument = trpc.documents.upload.useMutation();
  const { data: docs, refetch: refetchDocs } = trpc.documents.list.useQuery();

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setIsLoading(true);
    try {
      const res = await sendMessage.mutateAsync({ sessionId, conversationId, message: msg });
      setConversationId(res.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response, sources: res.sourcesCount }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus({ text: `Processando "${file.name}"...`, ok: true });
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await uploadDocument.mutateAsync({ filename: file.name, mimeType: file.type, base64Content: base64 });
        setUploadStatus({ text: `✓ "${res.title}" indexado (${res.chunkCount} trechos)`, ok: true });
        refetchDocs();
      } catch {
        setUploadStatus({ text: "✗ Erro ao processar o documento", ok: false });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function newChat() {
    setMessages([]);
    setConversationId(undefined);
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={S.root} className="chat-surface">
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🧠</div>
            <span style={S.logoText}>DocMind AI</span>
          </div>
          <button style={S.newChatBtn} onClick={newChat}>+ Nova conversa</button>
        </div>

        {/* Upload */}
        <div style={S.sidebarSection}>
          <div style={S.sectionLabel}>Documentos</div>
          <label
            style={S.uploadArea(hoveredUpload)}
            onMouseEnter={() => setHoveredUpload(true)}
            onMouseLeave={() => setHoveredUpload(false)}
          >
            <span style={{ fontSize: 18 }}>📎</span>
            <span>Upload de PDF</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          {uploadStatus && (
            <p style={uploadStatus.ok ? S.statusText : S.statusError}>{uploadStatus.text}</p>
          )}
        </div>

        {/* Doc list */}
        {docs && docs.length > 0 && (
          <div style={{ ...S.sidebarSection, paddingTop: 4, overflowY: "auto", maxHeight: 200 }}>
            {docs.map((doc) => (
              <div key={doc.id} style={S.docItem}>
                <div style={S.docDot(doc.status)} />
                <span style={S.docName} title={doc.title}>{doc.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* User card */}
        <div style={S.userCard}>
          <div style={S.avatar}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={S.userName}>{user.name}</div>
            <div style={S.userEmail}>{user.email}</div>
          </div>
          <button style={S.logoutBtn} onClick={onLogout} title="Sair">⏻</button>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.chatHeader}>
          <div style={S.statusDot} />
          <div>
            <div style={S.chatHeaderTitle}>Assistente de Documentos</div>
            <div style={S.chatHeaderSub}>
              {docs?.filter((d) => d.status === "ready").length ?? 0} documento(s) disponível(is)
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {messages.length === 0 && (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>🧠</div>
              <h3 style={S.emptyTitle}>Olá, {user.name.split(" ")[0]}!</h3>
              <p style={S.emptyText}>
                Faça uma pergunta sobre seus documentos ou envie um PDF pela barra lateral para começar.
              </p>
              <div style={S.suggestions}>
                {suggestions.map((s) => (
                  <button key={s} style={S.suggestionChip} onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={S.msgWrap(msg.role === "user")}>
              {msg.role === "assistant" && (
                <div style={S.msgAvatar(false)}>🧠</div>
              )}
              <div>
                <div style={S.bubble(msg.role === "user")}>{msg.content}</div>
                {msg.role === "assistant" && msg.sources !== undefined && msg.sources > 0 && (
                  <div style={S.sourcesBadge}>
                    <span>📄</span> {msg.sources} trecho(s) de documentos consultado(s)
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div style={S.msgAvatar(true)}>{initials[0]}</div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={S.msgAvatar(false)}>🧠</div>
              <div style={S.typing}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ ...S.typingDot, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={S.inputArea}>
          <div style={{ ...S.inputRow, borderColor: inputFocused ? "#6366f1" : "#334155" }}>
            <textarea
              ref={textareaRef}
              style={S.textarea}
              rows={1}
              placeholder="Pergunte algo sobre seus documentos... (Enter para enviar)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              disabled={isLoading}
            />
            <button style={S.sendBtn(!isLoading && !!input.trim())} onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
              ↑
            </button>
          </div>
          <p style={S.hint}>Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
