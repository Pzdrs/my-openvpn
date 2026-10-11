"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Server, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DtoCreateServerRequest } from "@/lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (server: DtoCreateServerRequest) => void;
};

export default function ServerEditorDialog({ open, onClose, onSave }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a server name.");
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
    setName("");
    setDescription("");
  }

  return (
    <dialog
      aria-labelledby="server-editor-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <form onSubmit={submit}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
              <Server className="size-5" />
            </div>
            <div>
              <h2
                id="server-editor-title"
                className="text-base font-semibold tracking-tight"
              >
                Add VPN server
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Set a recognizable name for this environment.
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
        <div className="space-y-4 px-6 py-5 sm:px-7 sm:py-6">
          <div>
            <label className="block text-sm font-medium" htmlFor="server-name">
              Name
            </label>
            <input
              autoFocus
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              id="server-name"
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="Production"
              value={name}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="server-description"
            >
              Description{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              id="server-description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="RADIUS-enabled production server"
              value={description}
            />
          </div>
          {error && (
            <p
              className="text-sm text-rose-600 dark:text-rose-400"
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
            Add server
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
