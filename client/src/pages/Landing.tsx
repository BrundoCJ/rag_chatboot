import React from "react";

const S = {
  page: { background: "#fff", minHeight: "100vh" } as React.CSSProperties,

  // Navbar
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 5%", height: 68,
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  } as React.CSSProperties,
  logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" } as React.CSSProperties,
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  } as React.CSSProperties,
  logoText: { fontWeight: 700, fontSize: 18, color: "#0f172a" } as React.CSSProperties,
  navBtn: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 24px", fontWeight: 600, fontSize: 14,
    cursor: "pointer", transition: "opacity .2s",
  } as React.CSSProperties,

  // Hero
  hero: {
    paddingTop: 120, paddingBottom: 80,
    textAlign: "center" as const,
    background: "linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)",
    position: "relative" as const, overflow: "hidden",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#ede9fe", color: "#6d28d9",
    padding: "6px 14px", borderRadius: 100,
    fontSize: 13, fontWeight: 600, marginBottom: 24,
  } as React.CSSProperties,
  heroTitle: {
    fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
    lineHeight: 1.1, letterSpacing: "-0.02em",
    color: "#0f172a", maxWidth: 780, margin: "0 auto 20px",
  } as React.CSSProperties,
  heroHighlight: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  } as React.CSSProperties,
  heroSub: {
    fontSize: 18, color: "#64748b", maxWidth: 560,
    margin: "0 auto 40px", lineHeight: 1.7,
  } as React.CSSProperties,
  heroCta: {
    display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const,
  },
  ctaPrimary: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "14px 32px", fontWeight: 700, fontSize: 16,
    cursor: "pointer", boxShadow: "0 4px 24px rgba(79,70,229,0.35)",
    transition: "transform .15s, box-shadow .15s",
  } as React.CSSProperties,
  ctaSecondary: {
    background: "transparent", color: "#4f46e5",
    border: "2px solid #e0e7ff", borderRadius: 12,
    padding: "14px 32px", fontWeight: 600, fontSize: 16, cursor: "pointer",
  } as React.CSSProperties,

  // Preview card
  previewWrap: {
    maxWidth: 900, margin: "60px auto 0", padding: "0 5%",
  } as React.CSSProperties,
  previewCard: {
    background: "#0f172a", borderRadius: 20,
    padding: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
    border: "1px solid #1e293b",
  } as React.CSSProperties,
  previewBar: {
    display: "flex", gap: 6, marginBottom: 16,
  } as React.CSSProperties,
  dot: (color: string) => ({
    width: 12, height: 12, borderRadius: "50%", background: color,
  }) as React.CSSProperties,
  previewChat: {
    display: "flex", flexDirection: "column" as const, gap: 12,
  },
  previewMsg: (isUser: boolean) => ({
    alignSelf: isUser ? "flex-end" : "flex-start",
    background: isUser ? "#4f46e5" : "#1e293b",
    color: "#f1f5f9", padding: "10px 16px",
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    fontSize: 13, maxWidth: "70%", lineHeight: 1.5,
  }) as React.CSSProperties,

  // Features
  features: {
    padding: "80px 5%", background: "#ffffff",
    maxWidth: 1100, margin: "0 auto",
  } as React.CSSProperties,
  sectionLabel: {
    textAlign: "center" as const, color: "#6d28d9", fontWeight: 600,
    fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 12,
  },
  sectionTitle: {
    textAlign: "center" as const, fontSize: "clamp(24px, 4vw, 40px)",
    fontWeight: 800, color: "#0f172a", marginBottom: 48,
    letterSpacing: "-0.02em",
  },
  grid3: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24,
  } as React.CSSProperties,
  featureCard: {
    background: "#f8f7ff", borderRadius: 16, padding: 28,
    border: "1px solid #ede9fe", transition: "transform .2s, box-shadow .2s",
  } as React.CSSProperties,
  featureIcon: {
    fontSize: 28, width: 56, height: 56, borderRadius: 14,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  } as React.CSSProperties,
  featureTitle: { fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 8 } as React.CSSProperties,
  featureText: { color: "#64748b", fontSize: 14, lineHeight: 1.7 } as React.CSSProperties,

  // Steps
  stepsSection: {
    padding: "80px 5%", background: "#f8f7ff",
  } as React.CSSProperties,
  stepsInner: { maxWidth: 800, margin: "0 auto" } as React.CSSProperties,
  stepsList: { display: "flex", flexDirection: "column" as const, gap: 20, marginTop: 48 },
  stepCard: {
    display: "flex", gap: 20, alignItems: "flex-start",
    background: "#fff", borderRadius: 16, padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  } as React.CSSProperties,
  stepNum: {
    minWidth: 44, height: 44,
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 18, color: "#fff",
  } as React.CSSProperties,
  stepTitle: { fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 } as React.CSSProperties,
  stepText: { color: "#64748b", fontSize: 14, lineHeight: 1.6 } as React.CSSProperties,

  // CTA banner
  ctaBanner: {
    margin: "80px 5%",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    borderRadius: 24, padding: "56px 48px", textAlign: "center" as const,
    boxShadow: "0 20px 60px rgba(79,70,229,0.3)",
  } as React.CSSProperties,
  ctaBannerTitle: { fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#fff", marginBottom: 12 } as React.CSSProperties,
  ctaBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 } as React.CSSProperties,
  ctaBannerBtn: {
    background: "#fff", color: "#4f46e5",
    border: "none", borderRadius: 12, padding: "14px 36px",
    fontWeight: 700, fontSize: 16, cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  } as React.CSSProperties,

  // Footer
  footer: {
    borderTop: "1px solid #f1f5f9", padding: "32px 5%",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap" as const, gap: 12,
    color: "#94a3b8", fontSize: 13,
  } as React.CSSProperties,
};

const features = [
  {
    icon: "📄",
    title: "Upload de Documentos",
    text: "Faça upload de PDFs e deixe a IA processar e indexar o conteúdo automaticamente em segundos.",
  },
  {
    icon: "🔍",
    title: "Busca Semântica",
    text: "Encontre informações relevantes nos seus documentos com busca por significado, não apenas palavras-chave.",
  },
  {
    icon: "🤖",
    title: "Respostas Precisas",
    text: "Receba respostas baseadas no conteúdo real dos seus documentos, powered by Google Gemini.",
  },
  {
    icon: "💬",
    title: "Chat Contextual",
    text: "Mantenha conversas completas com histórico e contexto, como falar com um especialista nos seus documentos.",
  },
  {
    icon: "🔒",
    title: "Dados Seguros",
    text: "Seus documentos ficam no seu ambiente. Controle total sobre privacidade e acesso aos dados.",
  },
  {
    icon: "⚡",
    title: "Respostas Instantâneas",
    text: "Obtenha respostas em segundos, sem precisar ler documentos inteiros para encontrar o que precisa.",
  },
];

const steps = [
  { title: "Crie sua conta", text: "Registre-se gratuitamente e acesse o painel do DocMind AI." },
  { title: "Faça upload dos seus PDFs", text: "Envie contratos, relatórios, manuais ou qualquer documento que precisar consultar." },
  { title: "Faça perguntas em linguagem natural", text: "Digite sua dúvida normalmente, como faria para um colega." },
  { title: "Receba respostas baseadas nos documentos", text: "A IA busca as informações certas e responde com precisão e contexto." },
];

export function Landing({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🧠</div>
          <span style={S.logoText}>DocMind AI</span>
        </div>
        <button style={S.navBtn} onClick={onLogin}>Entrar na plataforma →</button>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.heroBadge}>✨ Powered by Google Gemini 2.0 Flash</div>
        <h1 style={S.heroTitle}>
          Converse com seus{" "}
          <span style={S.heroHighlight}>documentos</span>
          {" "}usando IA
        </h1>
        <p style={S.heroSub}>
          Faça perguntas sobre seus PDFs e receba respostas precisas em segundos.
          Chega de perder horas procurando informações em documentos longos.
        </p>
        <div style={S.heroCta}>
          <button style={S.ctaPrimary} onClick={onLogin}>
            Começar gratuitamente
          </button>
          <button style={S.ctaSecondary} onClick={onLogin}>
            Ver demonstração
          </button>
        </div>

        {/* Preview */}
        <div style={S.previewWrap}>
          <div style={S.previewCard}>
            <div style={S.previewBar}>
              <div style={S.dot("#ef4444")} />
              <div style={S.dot("#f59e0b")} />
              <div style={S.dot("#22c55e")} />
            </div>
            <div style={S.previewChat}>
              <div style={S.previewMsg(false)}>
                👋 Olá! Faça upload de um PDF e comece a fazer perguntas.
              </div>
              <div style={S.previewMsg(true)}>
                Qual é o prazo de entrega previsto no contrato?
              </div>
              <div style={S.previewMsg(false)}>
                📄 Com base no <strong>Contrato_Fornecimento.pdf</strong>, o prazo de entrega previsto é de <strong>30 dias úteis</strong> a partir da assinatura, conforme cláusula 4.2.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <div style={S.features}>
          <p style={S.sectionLabel}>Funcionalidades</p>
          <h2 style={S.sectionTitle}>Tudo que você precisa em um só lugar</h2>
          <div style={S.grid3}>
            {features.map((f) => (
              <div key={f.title} style={S.featureCard}>
                <div style={S.featureIcon}>{f.icon}</div>
                <h3 style={S.featureTitle}>{f.title}</h3>
                <p style={S.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={S.stepsSection}>
        <div style={S.stepsInner}>
          <p style={S.sectionLabel}>Como funciona</p>
          <h2 style={S.sectionTitle}>Em 4 passos simples</h2>
          <div style={S.stepsList}>
            {steps.map((s, i) => (
              <div key={i} style={S.stepCard}>
                <div style={S.stepNum}>{i + 1}</div>
                <div>
                  <h4 style={S.stepTitle}>{s.title}</h4>
                  <p style={S.stepText}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={S.ctaBanner}>
          <h2 style={S.ctaBannerTitle}>Pronto para começar?</h2>
          <p style={S.ctaBannerSub}>
            Acesse agora e transforme a forma como você interage com documentos.
          </p>
          <button style={S.ctaBannerBtn} onClick={onLogin}>
            Acessar o DocMind AI
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{ fontWeight: 600, color: "#475569" }}>DocMind AI</span>
        </div>
        <span>© 2026 DocMind AI — Todos os direitos reservados</span>
      </footer>
    </div>
  );
}
