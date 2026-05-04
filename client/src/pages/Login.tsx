import React from "react";

export type UserSession = { name: string; email: string };

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(135deg, #f8f7ff 0%, #ede9fe 50%, #f0fdf4 100%)",
  } as React.CSSProperties,
  left: {
    flex: 1, display: "flex", flexDirection: "column" as const,
    justifyContent: "center", padding: "60px 5%",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#fff",
  } as React.CSSProperties,
  leftInner: { maxWidth: 440, margin: "0 auto" } as React.CSSProperties,
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 48 } as React.CSSProperties,
  logoIcon: {
    width: 40, height: 40, background: "rgba(255,255,255,0.2)",
    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
  } as React.CSSProperties,
  logoText: { fontWeight: 700, fontSize: 20, color: "#fff" } as React.CSSProperties,
  leftTitle: { fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 } as React.CSSProperties,
  leftSub: { color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.7, marginBottom: 40 } as React.CSSProperties,
  featureList: { display: "flex", flexDirection: "column" as const, gap: 16 },
  featureItem: { display: "flex", gap: 12, alignItems: "flex-start" } as React.CSSProperties,
  featureDot: {
    minWidth: 28, height: 28, borderRadius: 8,
    background: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
  } as React.CSSProperties,
  featureItemText: { fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 } as React.CSSProperties,

  right: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 5%",
  } as React.CSSProperties,
  card: {
    width: "100%", maxWidth: 420,
    background: "#fff", borderRadius: 24,
    padding: "40px 40px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
  } as React.CSSProperties,
  cardHeader: { marginBottom: 32 } as React.CSSProperties,
  cardTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 6 } as React.CSSProperties,
  cardSub: { color: "#64748b", fontSize: 14 } as React.CSSProperties,
  form: { display: "flex", flexDirection: "column" as const, gap: 20 },
  fieldGroup: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" } as React.CSSProperties,
  input: {
    border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 14px",
    fontSize: 14, color: "#0f172a", outline: "none", transition: "border-color .2s",
    width: "100%",
  } as React.CSSProperties,
  submit: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "14px", fontWeight: 700, fontSize: 15,
    cursor: "pointer", width: "100%",
    boxShadow: "0 4px 16px rgba(79,70,229,0.35)",
    transition: "opacity .2s, transform .1s",
  } as React.CSSProperties,
  divider: {
    textAlign: "center" as const, color: "#94a3b8", fontSize: 12, position: "relative" as const,
  },
  backLink: {
    textAlign: "center" as const, color: "#6d28d9", fontSize: 13, fontWeight: 500,
    cursor: "pointer", marginTop: 8,
  } as React.CSSProperties,
  error: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13,
  } as React.CSSProperties,
};

const highlights = [
  { icon: "📄", text: "Faça upload de qualquer PDF e converse com o conteúdo" },
  { icon: "🔍", text: "Busca semântica inteligente em todos os seus documentos" },
  { icon: "⚡", text: "Respostas precisas powered by Google Gemini 2.0 Flash" },
];

export function Login({ onLogin, onBack, theme, onToggleTheme }: { onLogin: (user: UserSession) => void; onBack: () => void; theme: string; onToggleTheme: () => void }) {
  const dark = theme === "dark";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [focused, setFocused] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Por favor, informe seu nome."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Informe um e-mail válido."); return; }
    setError("");
    onLogin({ name: name.trim(), email: email.trim() });
  }

  const inputStyle = (field: string) => ({
    ...S.input,
    borderColor: focused === field ? "#6d28d9" : "#e2e8f0",
    boxShadow: focused === field ? "0 0 0 3px rgba(109,40,217,0.12)" : "none",
  });

  const themeBtn: React.CSSProperties = { position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 };
  const dynCard = { ...S.card, background: dark ? "#1e293b" : "#fff", border: `1px solid ${dark ? "#334155" : "#f1f5f9"}` };
  const dynCardTitle = { ...S.cardTitle, color: dark ? "#f1f5f9" : "#0f172a" };
  const dynCardSub = { ...S.cardSub, color: dark ? "#94a3b8" : "#64748b" };
  const dynLabel = { ...S.label, color: dark ? "#94a3b8" : "#374151" };
  const dynInput = (field: string) => ({ ...inputStyle(field), background: dark ? "#0f172a" : "#fff", color: dark ? "#f1f5f9" : "#0f172a", borderColor: focused === field ? "#6d28d9" : dark ? "#334155" : "#e2e8f0" });
  const dynPage = { ...S.page, background: dark ? "linear-gradient(135deg,#0f172a,#1e293b)" : "linear-gradient(135deg,#f8f7ff,#ede9fe,#f0fdf4)" };

  return (
    <div style={dynPage}>
      {/* Left panel */}
      <div style={{ ...S.left, position: "relative" as const }}>
        <button style={themeBtn} onClick={onToggleTheme}>{dark ? "☀️" : "🌙"}</button>
        <div style={S.leftInner}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🧠</div>
            <span style={S.logoText}>DocMind AI</span>
          </div>
          <h2 style={S.leftTitle}>
            A inteligência artificial que entende seus documentos
          </h2>
          <p style={S.leftSub}>
            Pare de perder horas procurando informações. Com o DocMind AI, basta perguntar.
          </p>
          <div style={S.featureList}>
            {highlights.map((h) => (
              <div key={h.icon} style={S.featureItem}>
                <div style={S.featureDot}>{h.icon}</div>
                <p style={S.featureItemText}>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ ...S.right, background: dark ? "#0f172a" : "transparent" }}>
        <div style={dynCard}>
          <div style={S.cardHeader}>
            <h1 style={dynCardTitle}>Bem-vindo 👋</h1>
            <p style={dynCardSub}>Informe seus dados para acessar a plataforma</p>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            {error && <div style={S.error}>{error}</div>}

            <div style={S.fieldGroup}>
              <label style={dynLabel}>Seu nome</label>
              <input style={dynInput("name")} type="text" placeholder="Ex: João Silva" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} autoFocus />
            </div>

            <div style={S.fieldGroup}>
              <label style={dynLabel}>E-mail</label>
              <input style={dynInput("email")} type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
            </div>

            <button type="submit" style={S.submit}>Acessar a plataforma →</button>
          </form>

          <p style={{ ...S.backLink, color: dark ? "#a5b4fc" : "#6d28d9" }} onClick={onBack}>← Voltar para a página inicial</p>
        </div>
      </div>
    </div>
  );
}
