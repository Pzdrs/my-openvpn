import { DtoServer } from "@/lib/api/client";
import { FileKey2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  server: DtoServer;
  isAdmin: boolean;
  onAdd: () => void;
}

export default function NoProfileCard({ server, isAdmin, onAdd }: Props) {
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
      {isAdmin && (
        <Button
          className="mt-5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
          onClick={onAdd}
          type="button"
        >
          <Plus className="size-4" /> Add profile
        </Button>
      )}
    </div>
  );
}
