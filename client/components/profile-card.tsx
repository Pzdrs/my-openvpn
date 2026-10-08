import {
  downloadServerProfile,
  DtoLastProfileDownloadResponse,
  DtoServer,
  getLastProfileDownload,
} from "@/lib/api/client";
import { Check, Download, FileKey2, Pencil, Trash, TriangleAlert } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { ok } from "@oazapfts/runtime";
import { Spinner } from "./ui/spinner";

interface Props {
  server: DtoServer;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDownloaded: () => void;
}

function StatusBadge({
  server,
  lastDownload,
}: {
  server: DtoServer;
  lastDownload: DtoLastProfileDownloadResponse | null;
}) {
  if (!lastDownload) return null;

  if (lastDownload.exists) {
    if (lastDownload.last_downloaded_hash === server.profile?.hash) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-3" strokeWidth={3} /> Up to date
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
          <TriangleAlert className="size-3" strokeWidth={3} />
          New version available
        </span>
      );
    }
  } else {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
        <TriangleAlert className="size-3" strokeWidth={3} />
        Not downloaded yet
      </span>
    );
  }
}

export default function ProfileCard({
  server,
  isAdmin,
  onEdit,
  onDelete,
  onDownloaded,
}: Props) {
  const [lastDownloadState, setLastDownloadState] = useState<{
    serverId: number;
    download: DtoLastProfileDownloadResponse;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    ok(getLastProfileDownload(server.id))
      .then((response) => {
        if (!cancelled) {
          setLastDownloadState({ serverId: server.id, download: response });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching last profile download:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [server.id]);

  const lastDownload =
    lastDownloadState?.serverId === server.id
      ? lastDownloadState.download
      : null;

  function downloadProfile() {
    downloadServerProfile(server.id).then((response) => {
      const filename = response.headers
        .get("Content-Disposition")
        ?.split("filename=")[1];
      const blob = response.data;
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "profile.ovpn";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      ok(getLastProfileDownload(server.id))
        .then((response) => {
          setLastDownloadState({ serverId: server.id, download: response });
        })
        .catch((error) => {
          console.error("Error fetching last profile download:", error);
        });

      onDownloaded();
    });
  }

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "Not downloaded yet";

  if (!server.profile) return null;

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
        <div className="flex shrink-0 flex-col items-end gap-2">
          {lastDownload ? (
            <StatusBadge lastDownload={lastDownload} server={server} />
          ) : (
            <Spinner className="size-3" />
          )}

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                onClick={onDelete}
                size="sm"
                type="button"
                variant="destructive"
              >
                <Trash className="size-3.5" /> Delete profile
              </Button>
              <Button
                onClick={onEdit}
                size="sm"
                type="button"
                variant="outline"
              >
                <Pencil className="size-3.5" /> Edit profile
              </Button>
            </div>
          )}
        </div>
      </div>
      {lastDownload &&
        lastDownload.exists &&
        lastDownload.last_downloaded_hash !== server.profile.hash && (
          <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <p>Update issued: {formatDate(server.profile.updated_at)}</p>
            <p>
              Last downloaded: {formatDate(lastDownload.last_downloaded_at)}
            </p>
          </div>
        )}
      <Button
        className="mt-3 h-10 w-full rounded-xl bg-slate-900 text-sm shadow-sm hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
        size="lg"
        onClick={downloadProfile}
      >
        <Download className="size-4" /> Download profile
      </Button>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        Compatible with OpenVPN Connect and Tunnelblick
      </p>
    </>
  );
}
