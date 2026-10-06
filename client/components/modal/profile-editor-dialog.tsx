"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileKey2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ProfileEditorState = {
  serverId: number;
  mode: "add" | "edit";
} | null;

type Props = {
  open: boolean;
  mode: "add" | "edit";
  serverName: string;
  initialData: string;
  onClose: () => void;
  onSave: (data: string) => void;
};

export default function ProfileEditorDialog({
  open,
  mode,
  serverName,
  initialData,
  onClose,
  onSave,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data.trim()) {
      setError("Paste the OpenVPN profile before saving.");
      return;
    }

    onSave(data.trim());
  }

  return (
    <dialog
      aria-labelledby="profile-editor-title"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <form onSubmit={handleSubmit}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
              <FileKey2 className="size-5" />
            </div>
            <div>
              <h2
                id="profile-editor-title"
                className="text-base font-semibold tracking-tight"
              >
                {mode === "add"
                  ? "Add OpenVPN profile"
                  : "Edit OpenVPN profile"}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {serverName} environment
              </p>
            </div>
          </div>
          <Button
            aria-label="Close dialog"
            className="-mr-2 -mt-1 text-slate-500"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="px-6 py-5 sm:px-7 sm:py-6">
          <label htmlFor="profile-data" className="block text-sm font-medium">
            Profile configuration
          </label>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Paste the complete .ovpn configuration for this server.
          </p>
          <textarea
            autoFocus
            className="mt-3 min-h-64 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-mono text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            id="profile-data"
            onChange={(event) => {
              setData(event.target.value);
              setError(null);
            }}
            placeholder={"client\ndev tun\nproto udp\n..."}
            spellCheck={false}
            value={data}
          />
          {error && (
            <p
              className="mt-2 text-sm text-rose-600 dark:text-rose-400"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end sm:px-7">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
            type="submit"
          >
            {mode === "add" ? "Add profile" : "Save changes"}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
