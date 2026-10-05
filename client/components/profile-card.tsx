import { DtoServer } from "@/lib/api/client";
import { Check, Download, FileKey2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface Props {
  server: DtoServer;
}

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

export default function ProfileCard({ server }: Props) {
  const [preferences, setPreferences] = useState<
    Record<string, { autoConnect: boolean; splitTunnel: boolean }>
  >({});

  const currentPreferences = preferences[server.id] ?? {
    autoConnect: true,
    splitTunnel: false,
  };

  function updatePreference(
    key: "autoConnect" | "splitTunnel",
    value: boolean,
  ) {
    setPreferences((current) => ({
      ...current,
      [server.id]: {
        ...(current[server.id] ?? {
          autoConnect: true,
          splitTunnel: false,
        }),
        [key]: value,
      },
    }));
  }

  return (
    <>
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
              One profile for your {server.name.toLowerCase()} environment.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-3" strokeWidth={3} /> Active
        </span>
      </div>
      <div className="mt-5 border-t border-slate-200 pt-2">
        <Toggle
          checked={currentPreferences.autoConnect}
          onCheckedChange={(checked) =>
            updatePreference("autoConnect", checked)
          }
          label="Connect automatically"
          description="Connect when using an untrusted network."
        />
        <Toggle
          checked={currentPreferences.splitTunnel}
          onCheckedChange={(checked) =>
            updatePreference("splitTunnel", checked)
          }
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
    </>
  );
}
