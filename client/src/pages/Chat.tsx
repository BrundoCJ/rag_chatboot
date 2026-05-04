import React from "react";
import { trpc } from "../trpc";
import type { UserSession } from "./Login";

type Message = { role: "user" | "assistant"; content: string; sources?: number };

// Modal de confirmação
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e293b", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", border: "1px solid #334155", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <p style={{ color: "#f1f5f9", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            Excluir permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}

export function Chat({ user, onLogout, theme, onToggleTheme }: { user: UserSession; onLogout: () => void; theme: string; onToggleTheme: () => void }) {
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
  const [inputFocused, setInputFocused] = React.useState(false);
  const [confirm, setConfirm] = React.useState<{ message: string; onConfirm: () => void } | null>(null);
  const [hoveredConv, setHoveredConv] = React.useState<string | null>(null);
  const [hoveredDoc, setHoveredDoc] = React.useState<number | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const sendMessage = trpc.chat.sendMessage.useMutation();
  const uploadDocument = trpc.documents.upload.useMutation();
  const deleteConversation = trpc.chat.deleteConversation.useMutation();
  const clearHistory = trpc.chat.clearHistory.useMutation();
  const deleteDocument = trpc.documents.delete.useMutation();

  const { data: docs, refetch: refetchDocs } = trpc.documents.list.useQuery();
  const { data: conversations, refetch: refetchConvs } = trpc.chat.listConversations.useQuery({ sessionId });
  const getMessages = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId ?? "", sessionId },
    { enabled: !!conversationId }
  );

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Carrega mensagens ao trocar de conversa
  React.useEffect(() => {
    if (getMessages.data && conversationId) {
      setMessages(getMessages.data.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        sources: m.retrievalCount ?? 0,
      })));
    }
  }, [getMessages.data, conversationId]);

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
      refetchConvs();
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

  function loadConversation(convId: string) {
    setConversationId(convId);
    setMessages([]);
  }

  function newChat() {
    setMessages([]);
    setConversationId(undefined);
  }

  function askDeleteConv(convId: string) {
    setConfirm({
      message: "Deseja mesmo excluir permanentemente este histórico de conversa?",
      onConfirm: async () => {
        setConfirm(null);
        await deleteConversation.mutateAsync({ conversationId: convId, sessionId });
        if (conversationId === convId) newChat();
        refetchConvs();
      },
    });
  }

  function askClearAll() {
    setConfirm({
      message: "Deseja mesmo excluir permanentemente todo o histórico de conversas?",
      onConfirm: async () => {
        setConfirm(null);
        await clearHistory.mutateAsync({ sessionId });
        newChat();
        refetchConvs();
      },
    });
  }

  function askDeleteDoc(docId: number) {
    setConfirm({
      message: "Deseja mesmo excluir permanentemente este documento?",
      onConfirm: async () => {
        setConfirm(null);
        await deleteDocument.mutateAsync({ documentId: docId });
        refetchDocs();
      },
    });
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const readyDocs = docs?.filter((d) => d.status === "ready") ?? [];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", fontFamily: "inherit" }} className="chat-surface">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* ── Sidebar ── */}
      <div style={{ width: 280, background: "#1e293b", display: "flex", flexDirection: "column", borderRight: "1px solid #334155", overflow: "hidden" }}>

        {/* Logo + Nova conversa */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>DocMind AI</span>
          </div>
          <button onClick={newChat} style={{ width: "100%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            + Nova conversa
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* ── Documentos ── */}
          <div style={{ padding: "12px 16px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Documentos</p>
            <label style={{ display: "flex", alignItems: "center", gap: 10, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#334155", borderRadius: 10, padding: "12px 12px", cursor: "pointer", fontSize: 13, color: "#94a3b8" }}>
              <span style={{ fontSize: 16 }}>📎</span> Upload de PDF
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
            {uploadStatus && (
              <p style={{ fontSize: 11, color: uploadStatus.ok ? "#22c55e" : "#f87171", margin: "6px 4px 0", lineHeight: 1.4 }}>{uploadStatus.text}</p>
            )}

            {/* Lista de documentos */}
            {docs && docs.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    onMouseEnter={() => setHoveredDoc(doc.id)}
                    onMouseLeave={() => setHoveredDoc(null)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 4px", borderRadius: 6, background: hoveredDoc === doc.id ? "#0f172a" : "transparent" }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: doc.status === "ready" ? "#22c55e" : doc.status === "failed" ? "#f87171" : "#f59e0b" }} />
                    <span style={{ fontSize: 12, color: "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={doc.title}>{doc.title}</span>
                    {hoveredDoc === doc.id && (
                      <button onClick={() => askDeleteDoc(doc.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13, padding: "0 2px", flexShrink: 0 }} title="Excluir">✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Histórico de conversas ── */}
          <div style={{ padding: "16px 16px 0", borderTop: "1px solid #1e293b", marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>Conversas</p>
              {conversations && conversations.length > 0 && (
                <button onClick={askClearAll} style={{ fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Limpar histórico
                </button>
              )}
            </div>

            {(!conversations || conversations.length === 0) && (
              <p style={{ fontSize: 12, color: "#475569", padding: "4px 0" }}>Nenhuma conversa ainda</p>
            )}

            {conversations?.map((conv) => (
              <div
                key={conv.id}
                onMouseEnter={() => setHoveredConv(conv.id)}
                onMouseLeave={() => setHoveredConv(null)}
                onClick={() => loadConversation(conv.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 8px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
                  background: conversationId === conv.id ? "#0f172a" : hoveredConv === conv.id ? "rgba(255,255,255,0.04)" : "transparent",
                  borderLeft: conversationId === conv.id ? "2px solid #6366f1" : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: 13 }}>💬</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: "#cbd5e1", fontWeight: conversationId === conv.id ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.title || "Conversa"}
                  </p>
                  {conv.lastMessagePreview && (
                    <p style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMessagePreview}
                    </p>
                  )}
                </div>
                {hoveredConv === conv.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); askDeleteConv(conv.id); }}
                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13, padding: "0 2px", flexShrink: 0 }}
                    title="Excluir conversa"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #334155", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
          <button onClick={onToggleTheme} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, borderRadius: 6 }} title="Alternar tema">{theme === "dark" ? "☀️" : "🌙"}</button>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, borderRadius: 6 }} title="Sair">⏻</button>
        </div>
      </div>

      {/* ── Main chat ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>Assistente de Documentos</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{readyDocs.length} documento(s) disponível(is)</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 && (
            <div style={{ margin: "auto", textAlign: "center", color: "#475569", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🧠</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#94a3b8" }}>Olá, {user.name.split(" ")[0]}!</h3>
              <p style={{ fontSize: 14, color: "#475569", maxWidth: 360, lineHeight: 1.6 }}>Faça uma pergunta ou selecione uma conversa anterior na barra lateral.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {["O que diz o contrato sobre prazo de entrega?", "Quais são as cláusulas de rescisão?", "Resuma os pontos principais"].map((s) => (
                  <button key={s} onClick={() => handleSend(s)} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e293b", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🧠</div>
              )}
              <div>
                <div style={{
                  maxWidth: "72%", padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#1e293b",
                  color: "#f1f5f9", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap",
                  border: msg.role === "user" ? "none" : "1px solid #334155",
                }}>
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.sources !== undefined && msg.sources > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                    📄 {msg.sources} trecho(s) de documentos consultado(s)
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {initials[0]}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e293b", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🧠</div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px", background: "#1e293b", borderRadius: "18px 18px 18px 4px", border: "1px solid #334155" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 24px 18px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#1e293b", borderRadius: 16, padding: "10px 10px 10px 16px", borderWidth: 1.5, borderStyle: "solid", borderColor: inputFocused ? "#6366f1" : "#334155" }}>
            <textarea
              rows={1}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f1f5f9", fontSize: 14, resize: "none", lineHeight: 1.5, maxHeight: 120, minHeight: 24 }}
              placeholder="Pergunte algo sobre seus documentos... (Enter para enviar)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: !isLoading && input.trim() ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#334155", color: !isLoading && input.trim() ? "#fff" : "#64748b", cursor: !isLoading && input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}
            >↑</button>
          </div>
          <p style={{ fontSize: 11, color: "#475569", textAlign: "center", marginTop: 6 }}>Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
