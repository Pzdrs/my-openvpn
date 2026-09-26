"use client";

import { useState } from "react";
import {
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  FileKey2,
  Laptop,
  LogOut,
  MonitorSmartphone,
  Moon,
  MoreHorizontal,
  Network,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description: string;
};

function Toggle({ checked, onCheckedChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50">
      <span>
        <span className="block text-sm font-medium text-slate-800">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        aria-label={label}
        checked={checked}
        className="peer sr-only"
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
      />
      <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-cyan-600 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}

const devices = [
  {
    name: "MacBook Pro",
    detail: "macOS · Last seen today",
    icon: Laptop,
    current: true,
  },
  {
    name: "iPhone 15 Pro",
    detail: "iOS · Last seen today",
    icon: Smartphone,
    current: false,
  },
  {
    name: "ThinkPad X1",
    detail: "Windows · Last seen Sep 22",
    icon: MonitorSmartphone,
    current: false,
  },
];

export default function Home() {
  const [autoConnect, setAutoConnect] = useState(true);
  const [splitTunnel, setSplitTunnel] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <main
      className={`vpn-dashboard relative min-h-screen overflow-hidden bg-[#f6f8fb] px-4 py-7 sm:px-6 sm:py-12 ${darkMode ? "dark" : ""}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(186,230,253,0.42),_transparent_68%)]" />
      <section className="relative mx-auto w-full max-w-[610px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_22px_70px_-28px_rgba(15,23,42,0.24)]">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Network className="size-[18px]" strokeWidth={2.25} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              Northstar Access
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              aria-label={darkMode ? "Use light theme" : "Use dark theme"}
              className="text-slate-500 hover:text-slate-900"
              onClick={() => setDarkMode((current) => !current)}
              size="icon-sm"
              variant="ghost"
            >
              {darkMode ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
            </Button>
            <Button aria-label="Help" className="text-slate-500 hover:text-slate-900" size="icon-sm" variant="ghost">
              <CircleHelp className="size-[18px]" />
            </Button>
            <div className="relative">
              <button
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-xs font-semibold text-white shadow-sm ring-2 ring-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                onClick={() => setAccountOpen((current) => !current)}
                type="button"
              >
                AM
              </button>
              {accountOpen && (
                <div aria-label="Account options" className="absolute right-0 top-11 z-10 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" role="menu">
                  <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                    <div className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500"><UserRound className="size-3.5" /></div>
                    <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">Avery Morgan</p><p className="truncate text-[11px] text-slate-500">avery@northstar.io</p></div>
                  </div>
                  <div className="my-1 border-t border-slate-100" />
                  <a className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900" href="/logout" role="menuitem"><LogOut className="size-3.5" /> Sign out</a>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="px-6 pb-7 pt-8 sm:px-8 sm:pb-9">
          <div className="mb-8 flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <ShieldCheck className="size-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Your secure connection
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Download your OpenVPN profile or manage the devices registered
                to your account.
              </p>
            </div>
          </div>
          <section
            aria-labelledby="profile-heading"
            className="rounded-2xl border border-slate-200 bg-slate-50/65 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3.5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200">
                  <FileKey2 className="size-5" />
                </div>
                <div>
                  <h1
                    id="profile-heading"
                    className="text-sm font-semibold text-slate-900"
                  >
                    OpenVPN profile
                  </h1>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    One profile, kept current for all your devices.
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                <Check className="size-3" strokeWidth={3} /> Active
              </span>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-2">
              <Toggle
                checked={autoConnect}
                onCheckedChange={setAutoConnect}
                label="Connect automatically"
                description="Connect when using an untrusted network."
              />
              <Toggle
                checked={splitTunnel}
                onCheckedChange={setSplitTunnel}
                label="Use split tunneling"
                description="Only route company resources through the VPN."
              />
            </div>
            <Button
              className="mt-3 h-10 w-full rounded-xl bg-slate-900 text-sm shadow-sm hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
              size="lg"
            >
              <Download className="size-4" /> Download profile
            </Button>
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Compatible with OpenVPN Connect and Tunnelblick
            </p>
          </section>
          <section aria-labelledby="devices-heading" className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2
                  id="devices-heading"
                  className="text-sm font-semibold text-slate-900"
                >
                  Registered devices
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  3 of 5 devices in use
                </p>
              </div>
              <Button
                className="gap-1 text-xs text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
                size="sm"
                variant="ghost"
              >
                Manage <ChevronRight className="size-3.5" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {devices.map(({ name, detail, icon: Icon, current }) => (
                <div
                  className="flex items-center gap-3.5 px-4 py-3.5"
                  key={name}
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="size-[17px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {name}
                      </p>
                      {current && (
                        <span
                          aria-label="Currently active"
                          className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {detail}
                    </p>
                  </div>
                  <Button
                    aria-label={`Options for ${name}`}
                    className="text-slate-400 hover:text-slate-700"
                    size="icon-xs"
                    variant="ghost"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
          <footer className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400">
            <span>Signed in through your organization</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" /> All
              systems operational
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}
