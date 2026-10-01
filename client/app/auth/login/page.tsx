"use client";

import { oauth } from "@/lib/utils";
import { AlertCircle, ArrowRight, LoaderCircle, Network, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        if (oauth.isCallback(window.location)) {
          // Process the OIDC callback.
          await oauth.login(window.location);

          // Authentication completed. Navigate into the application.
          window.location.replace("/");
          return;
        }

        // Not a callback: initiate authentication with the IdP.
        await oauth.authorize(window.location);
      } catch (err) {
        console.error("OIDC authentication failed:", err);
        setError("We couldn't connect to your identity provider. Please try again.");
      }
    }

    initAuth();
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8fc] px-5 py-12 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-36 -top-40 size-[28rem] rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-48 -right-32 size-[32rem] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:opacity-40" />
      </div>

      <section className="relative w-full max-w-[430px] rounded-[28px] border border-white/80 bg-white/90 p-7 shadow-[0_28px_90px_-36px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/30 sm:p-10">
        <header className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
            <Network className="size-5" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">OpenVPN Lounge</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Secure network portal</p>
          </div>
        </header>

        <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-7 text-center dark:border-slate-800 dark:bg-slate-950/60 sm:px-7 sm:py-8" aria-live="polite">
          {error ? (
            <>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900">
                <AlertCircle className="size-6" />
              </div>
              <h1 className="mt-5 text-lg font-semibold tracking-tight">Sign in couldn’t start</h1>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">{error}</p>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
                onClick={() => window.location.reload()}
                type="button"
              >
                Try again <ArrowRight className="size-4" />
              </button>
            </>
          ) : (
            <>
              <div className="relative mx-auto grid size-16 place-items-center rounded-[20px] bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-900">
                <ShieldCheck className="size-7" strokeWidth={1.8} />
                <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-white text-cyan-700 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-cyan-300 dark:ring-slate-700">
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                </span>
              </div>
              <h1 className="mt-5 text-lg font-semibold tracking-tight">Preparing your secure sign in</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Connecting you to your organization. This should only take a moment.</p>
              <div className="mx-auto mt-7 flex w-fit items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <LoaderCircle className="size-3.5 animate-spin text-cyan-700" aria-hidden="true" />
                Redirecting securely
              </div>
            </>
          )}
        </div>

        <footer className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="size-3.5" /> Protected by your organization
        </footer>
      </section>
    </main>
  );
}
