import { DtoServer } from "@/lib/api/client";
import { ChevronRight, Server } from "lucide-react";

interface Props {
  servers: DtoServer[];
  selected: number;
  onSelect: (serverId: number) => void;
}

export default function ServerSelector({ servers, selected, onSelect }: Props) {
  return (
    <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-cyan-300 dark:ring-slate-700">
          <Server className="size-[18px]" />
        </div>
        <div>
          <label
            className="block text-xs font-medium text-slate-500 dark:text-slate-400"
            htmlFor="server-select"
          >
            Working with
          </label>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
            VPN server
          </p>
        </div>
      </div>
      <div className="relative min-w-0 sm:w-60">
        <select
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          id="server-select"
          onChange={(event) => onSelect(Number(event.target.value))}
          value={selected}
        >
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name}{" "}
              {server.description ? `· ${server.description}` : ""}
            </option>
          ))}
        </select>
        <ChevronRight
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-slate-400"
        />
      </div>
    </div>
  );
}
