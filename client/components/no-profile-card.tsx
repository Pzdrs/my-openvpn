import { DtoServer } from "@/lib/api/client";
import { FileKey2 } from "lucide-react";

interface Props {
  server: DtoServer;
}

export default function NoProfileCard({ server }: Props) {
  return (
    <div className="flex flex-col items-center px-3 py-6 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/80">
        <FileKey2 className="size-5" />
      </div>
      <h1
        id="profile-heading"
        className="mt-4 text-sm font-semibold text-slate-900"
      >
        No profile available
      </h1>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        There isn’t an OpenVPN profile for {server.name} yet. You can
        still manage this environment’s registered devices below.
      </p>
    </div>
  );
}
