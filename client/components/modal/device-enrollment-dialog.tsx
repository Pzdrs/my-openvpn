"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Laptop, Monitor, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DeviceEnrollment = {
  name: string;
  type?: "mobile" | "laptop" | "desktop";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onEnroll: (device: DeviceEnrollment) => void;
  initialDevice?: DeviceEnrollment;
  mode?: "enroll" | "edit";
};

const deviceTypes = [
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "desktop", label: "Desktop", icon: Monitor },
] as const;

function detectDeviceType(): DeviceEnrollment["type"] {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|mobile/.test(userAgent)
    ? "mobile"
    : "desktop";
}

export default function DeviceEnrollmentDialog({ open, onClose, onEnroll, initialDevice, mode = "enroll" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(initialDevice?.name ?? "");
  const [type, setType] = useState<DeviceEnrollment["type"]>(() =>
    initialDevice?.type ?? (typeof navigator === "undefined" ? undefined : detectDeviceType()),
  );
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
      setError("Enter a device name.");
      return;
    }
    onEnroll({ name: name.trim(), type });
    setName("");
    setType(detectDeviceType());
  }

  return (
    <dialog aria-labelledby="device-enrollment-title" className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={dialogRef}>
      <form onSubmit={submit}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:px-7">
          <div><h2 id="device-enrollment-title" className="text-base font-semibold tracking-tight">{mode === "edit" ? "Edit device" : "Enroll a device"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{mode === "edit" ? "Update this device’s display name or type." : "Give this device a name to register it for VPN access."}</p></div>
          <Button aria-label="Close dialog" className="-mr-2 -mt-1 text-slate-500" onClick={onClose} size="icon-sm" type="button" variant="ghost"><X className="size-4" /></Button>
        </header>
        <div className="space-y-5 px-6 py-5 sm:px-7 sm:py-6">
          <div><label className="block text-sm font-medium" htmlFor="device-name">Device name</label><input autoFocus className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" id="device-name" onChange={(event) => { setName(event.target.value); setError(null); }} placeholder="Avery’s MacBook Pro" value={name} />{error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400" role="alert">{error}</p>}</div>
          <fieldset><legend className="text-sm font-medium">Device type <span className="font-normal text-slate-400">(optional)</span></legend><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preselected from your browser. You can change it below.</p><div className="mt-2 grid grid-cols-3 gap-2">{deviceTypes.map(({ value, label, icon: Icon }) => <label className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${type === value ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`} key={value}><input checked={type === value} className="sr-only" name="device-type" onChange={() => setType(value)} type="radio" /><Icon className="size-5" />{label}</label>)}</div></fieldset>
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end sm:px-7"><Button onClick={onClose} type="button" variant="outline">Cancel</Button><Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300" type="submit">{mode === "edit" ? "Save changes" : "Enroll device"}</Button></footer>
      </form>
    </dialog>
  );
}
