export type Theme = "light" | "dark";

export function getTheme(): Theme {
  return (localStorage.getItem("theme") as Theme) ?? "light";
}

export function setTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}
