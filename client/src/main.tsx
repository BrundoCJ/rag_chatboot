import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient, queryClient } from "./trpc";
import "./index.css";
import { Landing } from "./pages/Landing";
import { Login, type UserSession } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { getTheme, setTheme, initTheme, type Theme } from "./theme";

type Page = "landing" | "login" | "chat";

function App() {
  const [theme, setThemeState] = React.useState<Theme>(() => initTheme());

  const [page, setPage] = React.useState<Page>(() => {
    try {
      return localStorage.getItem("docmind_user") ? "chat" : "landing";
    } catch { return "landing"; }
  });

  const [user, setUser] = React.useState<UserSession | null>(() => {
    try {
      const s = localStorage.getItem("docmind_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    setThemeState(next);
  }

  function handleLogin(session: UserSession) {
    localStorage.setItem("docmind_user", JSON.stringify(session));
    setUser(session);
    setPage("chat");
  }

  function handleLogout() {
    localStorage.removeItem("docmind_user");
    setUser(null);
    setPage("landing");
  }

  if (page === "landing") return <Landing onLogin={() => setPage("login")} theme={theme} onToggleTheme={toggleTheme} />;
  if (page === "login") return <Login onLogin={handleLogin} onBack={() => setPage("landing")} theme={theme} onToggleTheme={toggleTheme} />;
  if (page === "chat" && user) return <Chat user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
  return <Landing onLogin={() => setPage("login")} theme={theme} onToggleTheme={toggleTheme} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
