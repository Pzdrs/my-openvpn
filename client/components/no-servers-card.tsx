import { Server } from "lucide-react";

export default function NoServersCard() {
  return (
    <div className="mb-7 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
      <div className="grid size-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
        <Server className="size-5" />
      </div>
      <h1 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
        No VPN servers available
      </h1>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        There are no environments available for your account yet. Please check
        back later or contact your administrator.
      </p>
    </div>
  );
}
