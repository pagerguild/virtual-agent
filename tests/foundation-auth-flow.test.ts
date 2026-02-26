import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

// ── AC #1 — Starter baseline established ──────────────────────────────

describe("AC #1 — Project structure aligns with Vercel Supabase starter pattern", () => {
  it("root contains package.json with Next.js dependencies (not monorepo workspaces)", () => {
    const pkg = readJson("package.json");
    expect(pkg.dependencies?.next).toBeDefined();
    expect(pkg.dependencies?.react).toBeDefined();
    expect(pkg.dependencies?.["react-dom"]).toBeDefined();
    expect(pkg.workspaces).toBeUndefined();
  });

  it("root contains next.config.ts", () => {
    expect(existsSync(resolve(ROOT, "next.config.ts"))).toBe(true);
  });

  it("root contains tsconfig.json with App Router plugin", () => {
    const config = readJson("tsconfig.json");
    const plugins = config.compilerOptions?.plugins ?? [];
    const hasNextPlugin = plugins.some((p: { name: string }) => p.name === "next");
    expect(hasNextPlugin).toBe(true);
  });

  it("root contains tailwind.config.ts", () => {
    expect(existsSync(resolve(ROOT, "tailwind.config.ts"))).toBe(true);
  });

  it("has no turbo.json (not a turborepo)", () => {
    expect(existsSync(resolve(ROOT, "turbo.json"))).toBe(false);
  });

  it("has Supabase SSR dependency", () => {
    const pkg = readJson("package.json");
    expect(pkg.dependencies?.["@supabase/ssr"]).toBeDefined();
  });

  it("has Supabase JS dependency", () => {
    const pkg = readJson("package.json");
    expect(pkg.dependencies?.["@supabase/supabase-js"]).toBeDefined();
  });
});

// ── AC #1 — Supabase browser client utility ──────────────────────────

describe("AC #1 — Supabase browser client utility", () => {
  it("lib/supabase/client.ts exists", () => {
    expect(existsSync(resolve(ROOT, "lib/supabase/client.ts"))).toBe(true);
  });

  it("creates a browser client using @supabase/ssr", () => {
    const content = readText("lib/supabase/client.ts");
    expect(content).toContain("createBrowserClient");
    expect(content).toContain("@supabase/ssr");
  });

  it("references NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
    const content = readText("lib/supabase/client.ts");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });
});

// ── AC #1 — Supabase server client utility ──────────────────────────

describe("AC #1 — Supabase server client utility", () => {
  it("lib/supabase/server.ts exists", () => {
    expect(existsSync(resolve(ROOT, "lib/supabase/server.ts"))).toBe(true);
  });

  it("creates a server client using @supabase/ssr", () => {
    const content = readText("lib/supabase/server.ts");
    expect(content).toContain("createServerClient");
    expect(content).toContain("@supabase/ssr");
  });

  it("references NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
    const content = readText("lib/supabase/server.ts");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });
});

// ── AC #1 — Auth callback route ──────────────────────────────────────

describe("AC #1 — Auth callback route", () => {
  it("app/auth/callback/route.ts exists", () => {
    expect(existsSync(resolve(ROOT, "app/auth/callback/route.ts"))).toBe(true);
  });

  it("handles Supabase auth callback exchange", () => {
    const content = readText("app/auth/callback/route.ts");
    expect(content).toContain("exchangeCodeForSession");
  });

  it("redirects after successful authentication", () => {
    const content = readText("app/auth/callback/route.ts");
    expect(content).toContain("redirect");
  });
});

// ── AC #1 — Middleware protects dashboard routes ────────────────────

describe("AC #1 — Middleware protects /dashboard routes", () => {
  it("middleware.ts exists at the project root", () => {
    expect(existsSync(resolve(ROOT, "middleware.ts"))).toBe(true);
  });

  it("lib/supabase/middleware.ts intercepts /dashboard routes", () => {
    const content = readText("lib/supabase/middleware.ts");
    expect(content).toContain("/dashboard");
  });

  it("redirects unauthenticated users to /login", () => {
    const content = readText("lib/supabase/middleware.ts");
    expect(content).toContain("/login");
    // Should check for user and redirect to login when not authenticated
    expect(content).toContain("!user");
  });

  it("redirects authenticated users from auth pages to /dashboard", () => {
    const content = readText("lib/supabase/middleware.ts");
    // Should redirect logged-in users visiting /login or /signup to /dashboard
    expect(content).toContain("isAuthRoute");
    expect(content).toContain('"/dashboard"');
  });
});

// ── AC #1 — Environment variable example file ──────────────────────

describe("AC #1 — .env.local.example documents required Supabase variables", () => {
  it(".env.local.example exists at the project root", () => {
    expect(existsSync(resolve(ROOT, ".env.local.example"))).toBe(true);
  });

  it("contains NEXT_PUBLIC_SUPABASE_URL", () => {
    const content = readText(".env.local.example");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("contains NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
    const content = readText(".env.local.example");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("does not contain real secret values", () => {
    const content = readText(".env.local.example");
    const lines = content.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"));
    for (const line of lines) {
      const value = line.split("=")[1]?.trim();
      // Values should be empty, undefined, or placeholder-only (matching Vercel starter convention)
      const isPlaceholder = !value || value.startsWith("your-");
      expect(isPlaceholder).toBe(true);
    }
  });

  it("is not gitignored (tracked by !.env.local.example rule)", () => {
    const gitignore = readText(".gitignore");
    expect(gitignore).toContain("!.env.local.example");
  });
});

// ── AC #2 — Signup page renders ───────────────────────────────────────

describe("AC #2 — Signup page renders with email and password form", () => {
  it("app/signup/page.tsx exists", () => {
    expect(existsSync(resolve(ROOT, "app/signup/page.tsx"))).toBe(true);
  });

  it("contains an email input", () => {
    const content = readText("app/signup/page.tsx");
    expect(content).toContain('type="email"');
  });

  it("contains a password input", () => {
    const content = readText("app/signup/page.tsx");
    expect(content).toContain('type="password"');
  });

  it("contains a submit button for signup", () => {
    const content = readText("app/signup/page.tsx");
    expect(content).toContain('type="submit"');
    expect(content).toContain("Sign up");
  });

  it("calls Supabase auth.signUp", () => {
    const content = readText("app/signup/page.tsx");
    expect(content).toContain("signUp");
  });
});

// ── AC #3 — Login page renders ───────────────────────────────────────

describe("AC #3 — Login page renders with email and password form", () => {
  it("app/login/page.tsx exists", () => {
    expect(existsSync(resolve(ROOT, "app/login/page.tsx"))).toBe(true);
  });

  it("contains an email input", () => {
    const content = readText("app/login/page.tsx");
    expect(content).toContain('type="email"');
  });

  it("contains a password input", () => {
    const content = readText("app/login/page.tsx");
    expect(content).toContain('type="password"');
  });

  it("contains a submit button for login", () => {
    const content = readText("app/login/page.tsx");
    expect(content).toContain('type="submit"');
    expect(content).toContain("Sign in");
  });

  it("redirects to /dashboard on successful login", () => {
    const content = readText("app/login/page.tsx");
    expect(content).toContain('"/dashboard"');
  });

  it("calls Supabase auth.signInWithPassword", () => {
    const content = readText("app/login/page.tsx");
    expect(content).toContain("signInWithPassword");
  });
});

// ── AC #4 — Auth-gated access enforced ──────────────────────────────

describe("AC #4 — Auth-gated access: /dashboard is protected", () => {
  it("middleware protects routes starting with /dashboard", () => {
    const content = readText("lib/supabase/middleware.ts");
    expect(content).toContain('startsWith("/dashboard")');
  });

  it("unauthenticated users hitting /dashboard are redirected to /login", () => {
    const content = readText("lib/supabase/middleware.ts");
    // Should have logic: if no user and protected route → redirect to /login
    expect(content).toMatch(/!user.*isProtectedRoute|isProtectedRoute.*!user/s);
    expect(content).toContain('pathname = "/login"');
  });

  it("dashboard page exists and shows welcome message", () => {
    const content = readText("app/dashboard/page.tsx");
    expect(content).toContain("Welcome");
    expect(content).toContain("Dashboard");
  });

  it("dashboard layout wraps children with sidebar", () => {
    const content = readText("app/dashboard/layout.tsx");
    expect(content).toContain("Sidebar");
    expect(content).toContain("children");
  });
});

// ── AC #5 — Sign-out works ──────────────────────────────────────────

describe("AC #5 — Sign-out button visible and functional", () => {
  it("sign-out button component exists", () => {
    expect(existsSync(resolve(ROOT, "components/sign-out-button.tsx"))).toBe(true);
  });

  it("dashboard page includes the sign-out button", () => {
    const content = readText("app/dashboard/page.tsx");
    expect(content).toContain("SignOutButton");
  });

  it("sign-out button calls supabase.auth.signOut", () => {
    const content = readText("components/sign-out-button.tsx");
    expect(content).toContain("signOut");
  });

  it("sign-out redirects to /login", () => {
    const content = readText("components/sign-out-button.tsx");
    expect(content).toContain('"/login"');
  });
});

// ── AC #6 — Root page redirects to /dashboard ───────────────────────

describe("AC #6 — Root page redirects to /dashboard", () => {
  it("app/page.tsx exists", () => {
    expect(existsSync(resolve(ROOT, "app/page.tsx"))).toBe(true);
  });

  it("redirects to /dashboard", () => {
    const content = readText("app/page.tsx");
    expect(content).toContain('redirect("/dashboard")');
  });
});

// ── AC #6 — Build succeeds ──────────────────────────────────────────

describe("AC #6 — App builds successfully", () => {
  it("tsconfig.json excludes apps/ directory to avoid legacy type errors", () => {
    const config = readJson("tsconfig.json");
    expect(config.exclude).toContain("apps");
  });
});

// ── Sidebar navigation uses /dashboard prefix ───────────────────────

describe("Sidebar navigation uses /dashboard prefix", () => {
  it("sidebar component exists", () => {
    expect(existsSync(resolve(ROOT, "components/sidebar.tsx"))).toBe(true);
  });

  it("has nav links for Dashboard, Tours, Riders, Settings", () => {
    const content = readText("components/sidebar.tsx");
    expect(content).toContain("Dashboard");
    expect(content).toContain("Tours");
    expect(content).toContain("Riders");
    expect(content).toContain("Settings");
  });

  it("all nav links use /dashboard prefix", () => {
    const content = readText("components/sidebar.tsx");
    expect(content).toContain('"/dashboard"');
    expect(content).toContain('"/dashboard/tours"');
    expect(content).toContain('"/dashboard/riders"');
    expect(content).toContain('"/dashboard/settings"');
  });
});

// ── Legacy (dashboard) route group pages redirect ───────────────────

describe("Legacy (dashboard) route group pages redirect to /dashboard", () => {
  it("(dashboard)/page.tsx redirects to /dashboard", () => {
    const content = readText("app/(dashboard)/page.tsx");
    expect(content).toContain('redirect("/dashboard")');
  });

  it("(dashboard)/tours/page.tsx redirects to /dashboard", () => {
    const content = readText("app/(dashboard)/tours/page.tsx");
    expect(content).toContain('redirect("/dashboard")');
  });

  it("(dashboard)/riders/page.tsx redirects to /dashboard", () => {
    const content = readText("app/(dashboard)/riders/page.tsx");
    expect(content).toContain('redirect("/dashboard")');
  });

  it("(dashboard)/settings/page.tsx redirects to /dashboard", () => {
    const content = readText("app/(dashboard)/settings/page.tsx");
    expect(content).toContain('redirect("/dashboard")');
  });
});
