import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient, queryClient } from "./trpc";
import "./index.css";
import { Landing } from "./pages/Landing";
import { Login, type UserSession } from "./pages/Login";
import { Chat } from "./pages/Chat";

type Page = "landing" | "login" | "chat";

function App() {
  const [page, setPage] = React.useState<Page>(() => {
    try {
      const user = localStorage.getItem("docmind_user");
      return user ? "chat" : "landing";
    } catch {
      return "landing";
    }
  });

  const [user, setUser] = React.useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem("docmind_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

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

  if (page === "landing") return <Landing onLogin={() => setPage("login")} />;
  if (page === "login") return <Login onLogin={handleLogin} onBack={() => setPage("landing")} />;
  if (page === "chat" && user) return <Chat user={user} onLogout={handleLogout} />;

  return <Landing onLogin={() => setPage("login")} />;
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
