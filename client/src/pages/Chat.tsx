import React from "react";
import { trpc } from "../trpc";
import type { UserSession } from "./Login";

type Message = { role: "user" | "assistant"; content: string; sources?: number };

function ConfirmDialog({ message, onConfirm, onCancel, dark }: { message: string; onConfirm: () => void; onCancel: () => void; dark: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        <p style={{ color: dark ? "#f1f5f9" : "#1e293b", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: dark ? "#334155" : "#f1f5f9", color: dark ? "#94a3b8" : "#64748b", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
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
  const dark = theme === "dark";

  // Paleta dinâmica
  const c = {
    bg:         dark ? "#0f172a" : "#f8fafc",
    sidebar:    dark ? "#1e293b" : "#ffffff",
    border:     dark ? "#334155" : "#e2e8f0",
    surface:    dark ? "#1e293b" : "#ffffff",
    surface2:   dark ? "#0f172a" : "#f1f5f9",
    text:       dark ? "#f1f5f9" : "#0f172a",
    textMuted:  dark ? "#94a3b8" : "#64748b",
    textFaint:  dark ? "#475569" : "#94a3b8",
    inputBg:    dark ? "#1e293b" : "#ffffff",
    inputBorder:dark ? "#334155" : "#e2e8f0",
    bubbleAI:   dark ? "#1e293b" : "#f1f5f9",
    bubbleBorder: dark ? "#334155" : "#e2e8f0",
    hoverBg:    dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    activeBg:   dark ? "#0f172a" : "#ede9fe",
    sectionLabel: dark ? "#64748b" : "#94a3b8",
    scrollThumb: dark ? "#334155" : "#cbd5e1",
  };

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

  const sendMessage      = trpc.chat.sendMessage.useMutation();
  const uploadDocument   = trpc.documents.upload.useMutation();
  const deleteConv       = trpc.chat.deleteConversation.useMutation();
  const clearHistory     = trpc.chat.clearHistory.useMutation();
  const deleteDoc        = trpc.documents.delete.useMutation();

  const { data: docs,          refetch: refetchDocs  } = trpc.documents.list.useQuery();
  const { data: conversations, refetch: refetchConvs } = trpc.chat.listConversations.useQuery({ sessionId });
  const getMessages = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId ?? "", sessionId },
    { enabled: !!conversationId }
  );

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

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
    } finally { setIsLoading(false); }
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
      } catch { setUploadStatus({ text: "✗ Erro ao processar o documento", ok: false }); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function newChat() { setMessages([]); setConversationId(undefined); }

  function askDeleteConv(convId: string) {
    setConfirm({ message: "Deseja mesmo excluir permanentemente este histórico de conversa?",
      onConfirm: async () => {
        setConfirm(null);
        await deleteConv.mutateAsync({ conversationId: convId, sessionId });
        if (conversationId === convId) newChat();
        refetchConvs();
      }
    });
  }

  function askClearAll() {
    setConfirm({ message: "Deseja mesmo excluir permanentemente todo o histórico de conversas?",
      onConfirm: async () => {
        setConfirm(null);
        await clearHistory.mutateAsync({ sessionId });
        newChat();
        refetchConvs();
      }
    });
  }

  function askDeleteDoc(docId: number) {
    setConfirm({ message: "Deseja mesmo excluir permanentemente este documento?",
      onConfirm: async () => {
        setConfirm(null);
        await deleteDoc.mutateAsync({ documentId: docId });
        refetchDocs();
      }
    });
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const readyDocs = docs?.filter((d) => d.status === "ready") ?? [];

  return (
    <div style={{ display: "flex", height: "100vh", background: c.bg, fontFamily: "inherit", transition: "background .3s, color .3s" }}>
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} dark={dark} />}

      {/* ── Sidebar ── */}
      <div style={{ width: 280, background: c.sidebar, display: "flex", flexDirection: "column", borderRight: `1px solid ${c.border}`, overflow: "hidden", transition: "background .3s" }}>

        {/* Logo + Nova conversa */}
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: c.text }}>DocMind AI</span>
          </div>
          <button onClick={newChat} style={{ width: "100%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            + Nova conversa
          </button>
        </div>

        {/* Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Documentos */}
          <div style={{ padding: "12px 16px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.sectionLabel, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Documentos</p>
            <label style={{ display: "flex", alignItems: "center", gap: 10, borderWidth: 1.5, borderStyle: "dashed", borderColor: c.border, borderRadius: 10, padding: "12px", cursor: "pointer", fontSize: 13, color: c.textMuted, background: "transparent" }}>
              <span style={{ fontSize: 16 }}>📎</span> Upload de PDF
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
            {uploadStatus && (
              <p style={{ fontSize: 11, color: uploadStatus.ok ? "#22c55e" : "#f87171", margin: "6px 4px 0", lineHeight: 1.4 }}>{uploadStatus.text}</p>
            )}
            {docs && docs.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
                {docs.map((doc) => (
                  <div key={doc.id} onMouseEnter={() => setHoveredDoc(doc.id)} onMouseLeave={() => setHoveredDoc(null)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 4px", borderRadius: 6, background: hoveredDoc === doc.id ? c.hoverBg : "transparent" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: doc.status === "ready" ? "#22c55e" : doc.status === "failed" ? "#f87171" : "#f59e0b" }} />
                    <span style={{ fontSize: 12, color: c.textMuted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={doc.title}>{doc.title}</span>
                    {hoveredDoc === doc.id && (
                      <button onClick={() => askDeleteDoc(doc.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico */}
          <div style={{ padding: "16px 16px 0", marginTop: 8, borderTop: `1px solid ${c.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: c.sectionLabel, letterSpacing: "0.06em", textTransform: "uppercase" }}>Conversas</p>
              {conversations && conversations.length > 0 && (
                <button onClick={askClearAll} style={{ fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Limpar histórico</button>
              )}
            </div>
            {(!conversations || conversations.length === 0) && (
              <p style={{ fontSize: 12, color: c.textFaint }}>Nenhuma conversa ainda</p>
            )}
            {conversations?.map((conv) => (
              <div key={conv.id} onMouseEnter={() => setHoveredConv(conv.id)} onMouseLeave={() => setHoveredConv(null)} onClick={() => { setConversationId(conv.id); setMessages([]); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px", borderRadius: 8, marginBottom: 2, cursor: "pointer", transition: "background .15s",
                  background: conversationId === conv.id ? c.activeBg : hoveredConv === conv.id ? c.hoverBg : "transparent",
                  borderLeft: conversationId === conv.id ? "2px solid #6366f1" : "2px solid transparent" }}>
                <span style={{ fontSize: 13 }}>💬</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: c.text, fontWeight: conversationId === conv.id ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.title || "Conversa"}
                  </p>
                  {conv.lastMessagePreview && (
                    <p style={{ fontSize: 11, color: c.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.lastMessagePreview}</p>
                  )}
                </div>
                {hoveredConv === conv.id && (
                  <button onClick={(e) => { e.stopPropagation(); askDeleteConv(conv.id); }}
                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 10, background: c.sidebar }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: c.text }}>{user.name}</div>
            <div style={{ fontSize: 11, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
          <button onClick={onToggleTheme} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 17, borderRadius: 6, padding: 2 }} title="Alternar tema">{dark ? "☀️" : "🌙"}</button>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: c.textMuted, cursor: "pointer", fontSize: 16, borderRadius: 6 }} title="Sair">⏻</button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, transition: "background .3s" }}>

        {/* Header */}
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 10, background: c.sidebar, transition: "background .3s" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: c.text }}>Assistente de Documentos</div>
            <div style={{ fontSize: 12, color: c.textMuted }}>{readyDocs.length} documento(s) disponível(is)</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 && (
            <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🧠</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: c.textMuted }}>Olá, {user.name.split(" ")[0]}!</h3>
              <p style={{ fontSize: 14, color: c.textFaint, maxWidth: 360, lineHeight: 1.6 }}>Faça uma pergunta ou selecione uma conversa anterior na barra lateral.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {["O que diz o contrato sobre prazo de entrega?", "Quais são as cláusulas de rescisão?", "Resuma os pontos principais"].map((s) => (
                  <button key={s} onClick={() => handleSend(s)}
                    style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textMuted, borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.surface, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🧠</div>
              )}
              <div>
                <div style={{
                  maxWidth: "72%", padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : c.bubbleAI,
                  color: msg.role === "user" ? "#fff" : c.text,
                  fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap",
                  border: msg.role === "user" ? "none" : `1px solid ${c.bubbleBorder}`,
                  boxShadow: msg.role === "user" ? "0 2px 12px rgba(79,70,229,0.25)" : "none",
                }}>
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.sources !== undefined && msg.sources > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: c.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                    📄 {msg.sources} trecho(s) consultado(s)
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
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.surface, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🧠</div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px", background: c.bubbleAI, borderRadius: "18px 18px 18px 4px", border: `1px solid ${c.bubbleBorder}` }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c.textMuted, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 24px 18px", borderTop: `1px solid ${c.border}`, background: c.sidebar, transition: "background .3s" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: c.inputBg, borderRadius: 16, padding: "10px 10px 10px 16px", borderWidth: 1.5, borderStyle: "solid", borderColor: inputFocused ? "#6366f1" : c.inputBorder, transition: "border-color .2s, background .3s" }}>
            <textarea rows={1}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: c.text, fontSize: 14, resize: "none", lineHeight: 1.5, maxHeight: 120, minHeight: 24 }}
              placeholder="Pergunte algo sobre seus documentos... (Enter para enviar)"
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} disabled={isLoading}
            />
            <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}
              style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: !isLoading && input.trim() ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : c.surface2, color: !isLoading && input.trim() ? "#fff" : c.textMuted, cursor: !isLoading && input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, transition: "all .2s" }}>↑</button>
          </div>
          <p style={{ fontSize: 11, color: c.textFaint, textAlign: "center", marginTop: 6 }}>Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
