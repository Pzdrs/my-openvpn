import { useAuth } from "@/lib/auth/context";
import {
  CircleHelp,
  LogOut,
  Moon,
  Network,
  Sun,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export default function Header() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
          <Network className="size-[18px]" strokeWidth={2.25} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          My OpenVPN
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          aria-label={darkMode ? "Use light theme" : "Use dark theme"}
          className="text-slate-500 hover:text-slate-900"
          onClick={toggleDarkMode}
          size="icon-sm"
          variant="ghost"
        >
          {darkMode ? (
            <Sun className="size-[17px]" />
          ) : (
            <Moon className="size-[17px]" />
          )}
        </Button>
        <Button
          aria-label="Help"
          className="text-slate-500 hover:text-slate-900"
          size="icon-sm"
          variant="ghost"
        >
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
           <img src={user.picture} alt={user.name} className="size-full rounded-full object-cover" /> 
          </button>
          {accountOpen && (
            <div
              aria-label="Account options"
              className="absolute right-0 top-11 z-10 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
              role="menu"
            >
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <div className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <UserRound className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="my-1 border-t border-slate-100" />
              <a
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                onClick={() => logout()}
                role="menuitem"
              >
                <LogOut className="size-3.5" /> Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
