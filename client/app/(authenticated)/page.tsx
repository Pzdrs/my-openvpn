"use client";

import { ConfirmDeleteDialog } from "@/components/dialog/alert-dialog-destructive";
import Header from "@/components/Header";
import ProfileEditorDialog, {
  ProfileEditorState,
} from "@/components/modal/profile-editor-dialog";
import DeviceEnrollmentDialog, { DeviceEnrollment } from "@/components/modal/device-enrollment-dialog";
import ServerEditorDialog from "@/components/modal/server-editor-dialog";
import NoProfileCard from "@/components/no-profile-card";
import NoServersCard from "@/components/no-servers-card";
import ProfileCard from "@/components/profile-card";
import ServerSelector from "@/components/server-selector";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  createServer,
  deleteServer,
  deleteServerProfile,
  DtoCreateServerRequest,
  DtoServer,
  getUserServers,
  updateServerProfile,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { ok } from "@oazapfts/runtime";
import { Download, Laptop, Monitor, Pencil, Plus, RefreshCw, ShieldOff, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type ManagedDevice = {
  id: string;
  name: string;
  type: "mobile" | "laptop" | "desktop";
  expiresAt: string;
};

const mockDevices: ManagedDevice[] = [
  { id: "phone", name: "Avery’s iPhone", type: "mobile", expiresAt: "2027-08-18" },
  { id: "laptop", name: "Avery’s MacBook Pro", type: "laptop", expiresAt: "2026-12-08" },
  { id: "desktop", name: "Office workstation", type: "desktop", expiresAt: "2026-11-16" },
];

const deviceIcons = { mobile: Smartphone, laptop: Laptop, desktop: Monitor };

function certificateStatus(expiresAt: string) {
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
  if (days <= 7) return { label: days <= 0 ? "Expired" : `Expires in ${days} days`, className: "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900" };
  if (days <= 30) return { label: `Expires in ${days} days`, className: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900" };
  return { label: "Valid", className: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900" };
}

export default function Home() {
  const { user } = useAuth();
  const [servers, setServers] = useState<DtoServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState(
    servers.length > 0 ? servers[0].id : 0,
  );
  const [profileEditor, setProfileEditor] = useState<ProfileEditorState>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isServerEditorOpen, setIsServerEditorOpen] = useState(false);
  const [isDeleteServerDialogOpen, setIsDeleteServerDialogOpen] =
    useState(false);
  const [isDeviceEnrollmentOpen, setIsDeviceEnrollmentOpen] = useState(false);
  const [devices, setDevices] = useState<ManagedDevice[]>(mockDevices);
  const [editingDevice, setEditingDevice] = useState<ManagedDevice | null>(null);
  const [deviceToRemove, setDeviceToRemove] = useState<ManagedDevice | null>(null);

  const [isLoadingServers, setIsLoadingServers] = useState(true);

  useEffect(() => {
    async function fetchServers() {
      ok(getUserServers())
        .then((response) => {
          response.forEach((server) => {
            if (server.profile) {
              server.profile.data = atob(server.profile.data);
            }
          });

          setServers(response);
          if (response.length > 0) {
            setSelectedServerId(response[0].id);
          }
        })
        .catch((error) => {
          toast.add({
            type: "error",
            title: "Failed to fetch servers",
            description:
              error.message || "An error occurred while fetching servers.",
          });
        })
        .finally(() => {
          setIsLoadingServers(false);
        });
    }

    fetchServers();
  }, []);

  const { darkMode } = useTheme();
  const selectedServer = servers.find(
    (server) => server.id === selectedServerId,
  );
  const profileEditorServer = servers.find(
    (server) => server.id === profileEditor?.serverId,
  );

  function saveProfile(data: string) {
    if (!profileEditor) return;

    ok(
      updateServerProfile(profileEditor.serverId, {
        profile_data: btoa(data),
      }),
    )
      .then((profile) => {
        profile.data = atob(profile.data);

        setServers((current) =>
          current.map((server) =>
            server.id === profileEditor.serverId
              ? { ...server, profile }
              : server,
          ),
        );
        setProfileEditor(null);
        toast.add({
          type: "success",
          description:
            profileEditor.mode === "add"
              ? "Profile added successfully."
              : "Profile updated successfully.",
        });
      })
      .catch((error) => {
        toast.add({
          type: "error",
          title:
            profileEditor.mode === "add"
              ? "Failed to add profile"
              : "Failed to update profile",
          description:
            error.message ||
            `An error occurred while ${
              profileEditor.mode === "add" ? "adding" : "updating"
            } the profile.`,
        });
      });
  }

  function deleteProfile() {
    if (!selectedServer) return;

    setIsDeleteDialogOpen(false);
    deleteServerProfile(selectedServer.id)
      .then(() => {
        setServers((current) =>
          current.map((server) =>
            server.id === selectedServer.id && server.profile
              ? {
                  ...server,
                  profile: undefined,
                }
              : server,
          ),
        );
      })
      .catch((error) => {
        toast.add({
          type: "error",
          title: "Failed to delete profile",
          description:
            error.message || "An error occurred while deleting the profile.",
        });
      });

    toast.add({
      type: "success",
      description: "Profile deleted successfully.",
    });
  }

  function handleAddServer(server: DtoCreateServerRequest) {
    setIsServerEditorOpen(false);
    ok(createServer(server))
      .then((newServer) => {
        setServers((current) => [...current, newServer]);
        setSelectedServerId(newServer.id);
        toast.add({
          type: "success",
          description: "Server created successfully.",
        });
      })
      .catch((error) => {
        toast.add({
          type: "error",
          title: "Failed to create server",
          description:
            error.message || "An error occurred while creating the server.",
        });
      });
  }

  function handleDeleteServer() {
    setIsDeleteServerDialogOpen(false);
    deleteServer(selectedServerId)
      .then(() => {
        setServers((current) =>
          current.filter((server) => server.id !== selectedServerId),
        );

        // select the next available server if any, otherwise set to 0
        const remainingServers = servers.filter(
          (server) => server.id !== selectedServerId,
        );
        if (remainingServers.length > 0) {
          setSelectedServerId(remainingServers[0].id);
        } else {
          setSelectedServerId(0);
        }

        toast.add({
          type: "success",
          description: "Server deleted successfully.",
        });
      })
      .catch((error) => {
        toast.add({
          type: "error",
          title: "Failed to delete server",
          description:
            error.message || "An error occurred while deleting the server.",
        });
      });
  }

  function enrollDevice(device: DeviceEnrollment) {
    console.log("Enroll device", { serverId: selectedServerId, ...device });
    setIsDeviceEnrollmentOpen(false);
    setDevices((current) => [
      ...current,
      { id: crypto.randomUUID(), name: device.name, type: device.type ?? "desktop", expiresAt: "2027-11-11" },
    ]);
  }

  function updateDevice(device: DeviceEnrollment) {
    if (!editingDevice) return;
    console.log("Update device", { id: editingDevice.id, ...device });
    setDevices((current) => current.map((item) => item.id === editingDevice.id ? { ...item, name: device.name, type: device.type ?? item.type } : item));
    setEditingDevice(null);
  }

  function removeDevice() {
    if (!deviceToRemove) return;
    console.log("Remove device", deviceToRemove);
    setDevices((current) => current.filter((item) => item.id !== deviceToRemove.id));
    setDeviceToRemove(null);
  }

  return (
    <main
      className={`vpn-dashboard relative min-h-screen overflow-hidden bg-[#f6f8fb] px-4 py-7 sm:px-6 sm:py-12 ${darkMode ? "dark" : ""}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(186,230,253,0.42),_transparent_68%)]" />
      <section className="relative mx-auto w-full max-w-[610px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_22px_70px_-28px_rgba(15,23,42,0.24)]">
        <Header />
        <div className="px-6 pb-7 pt-8 sm:px-8 sm:pb-9">
          {isLoadingServers ? (
            <div aria-busy="true" className="animate-pulse" role="status">
              <span className="sr-only">Loading servers</span>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  <div className="h-7 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="mt-4 h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="mt-10 space-y-10 border-t border-slate-100 pt-8 dark:border-slate-800">
                <div>
                  <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-3 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/65 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3"><div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700" /><div className="space-y-2"><div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-2.5 w-44 rounded bg-slate-200 dark:bg-slate-700" /></div></div>
                      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="mt-5 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div>
                  <div className="h-2.5 w-14 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-3 w-56 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-3 h-24 rounded-2xl border border-slate-200 bg-slate-50/65 dark:border-slate-700 dark:bg-slate-900/80" />
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-5 dark:border-slate-800"><div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-slate-700" /></div>
              </div>
            </div>
          ) : servers.length > 0 ? (
              <ServerSelector
                servers={servers}
                selected={selectedServerId}
                onSelect={setSelectedServerId}
                onDelete={() => setIsDeleteServerDialogOpen(true)}
                onAdd={() => setIsServerEditorOpen(true)}
              />
          ) : (
              <NoServersCard onAdd={() => setIsServerEditorOpen(true)} />
          )}

          {selectedServer && (
            <div className="mt-10 space-y-10 border-t border-slate-100 pt-8 dark:border-slate-800">
              <section
                aria-labelledby="profile-section-heading"
              >
                <div className="mb-3">
                  <p className="text-xs font-semibold tracking-[0.12em] text-cyan-700 uppercase dark:text-cyan-300">
                    Connection
                  </p>
                  <h2 id="profile-section-heading" className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    OpenVPN profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Download and manage the profile for {selectedServer.name}.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/65 p-4 dark:border-slate-700 dark:bg-slate-900/80 sm:p-5">
                {selectedServer.profile ? (
                  <ProfileCard
                    isAdmin={user.is_admin}
                    onDownloaded={() => {
                      setServers((current) =>
                        current.map((server) =>
                          server.id === selectedServer.id && server.profile
                            ? {
                                ...server,
                                profile: {
                                  ...server.profile,
                                  last_downloaded_at: new Date().toISOString(),
                                },
                              }
                            : server,
                        ),
                      );
                      toast.add({
                        type: "success",
                        description: "Profile downloaded successfully.",
                      });
                    }}
                    onEdit={() => {
                      setProfileEditor({
                        serverId: selectedServer.id,
                        mode: "edit",
                      });
                    }}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                    server={selectedServer}
                  />
                ) : (
                  <NoProfileCard
                    isAdmin={user.is_admin}
                    onAdd={() => {
                      setProfileEditor({
                        serverId: selectedServer.id,
                        mode: "add",
                      });
                    }}
                    server={selectedServer}
                  />
                )}
                </div>
              </section>
              <section aria-labelledby="devices-heading">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-cyan-700 uppercase dark:text-cyan-300">
                      Access
                    </p>
                    <h2
                      id="devices-heading"
                      className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Registered devices
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Devices authorized to use {selectedServer.name}.
                    </p>
                  </div>
                  <Button
                    className="mt-0.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
                    onClick={() => setIsDeviceEnrollmentOpen(true)}
                    size="sm"
                    type="button"
                  >
                    <Plus /> Enroll device
                  </Button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/65 dark:border-slate-700 dark:bg-slate-900/80">
                  {/* Overflow menu na remove a edit a revoke + na karte chceme download a renew (disabled pro expiry > 30 dni)*/}
                  {devices.map((device) => {
                    const Icon = deviceIcons[device.type];
                    const status = certificateStatus(device.expiresAt);
                    return (
                      <div className="border-b border-slate-200 p-4 last:border-b-0 dark:border-slate-700" key={device.id}>
                        <div className="flex items-start gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"><Icon className="size-[18px]" /></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{device.name}</p><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${status.className}`}>{status.label}</span></div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{device.type[0].toUpperCase() + device.type.slice(1)} · Certificate expires {new Date(device.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button aria-label={`Edit ${device.name}`} className="text-slate-500" onClick={() => setEditingDevice(device)} size="icon-xs" type="button" variant="ghost"><Pencil className="size-3.5" /></Button>
                            <Button aria-label={`Remove ${device.name}`} onClick={() => setDeviceToRemove(device)} size="icon-xs" type="button" variant="destructive"><Trash2 className="size-3.5" /></Button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
                          <Button onClick={() => console.log("Download device certificate", device)} size="sm" type="button" variant="outline"><Download className="size-3.5" /> Download certificate</Button>
                          <Button onClick={() => console.log("Renew device certificate", device)} size="sm" type="button" variant="secondary"><RefreshCw className="size-3.5" /> Renew certificate</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              <footer className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400">
                <span>Viewing {selectedServer.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> All
                  systems operational
                </span>
              </footer>
            </div>
          )}
          {user.is_admin && profileEditor && profileEditorServer && (
            <ProfileEditorDialog
              key={`${profileEditor.serverId}-${profileEditor.mode}`}
              initialData={profileEditorServer.profile?.data ?? ""}
              mode={profileEditor.mode}
              onClose={() => setProfileEditor(null)}
              onSave={saveProfile}
              open
              serverName={profileEditorServer.name}
            />
          )}
          <ServerEditorDialog
            onClose={() => setIsServerEditorOpen(false)}
            onSave={handleAddServer}
            open={isServerEditorOpen}
          />
          <DeviceEnrollmentDialog
            onClose={() => setIsDeviceEnrollmentOpen(false)}
            onEnroll={enrollDevice}
            open={isDeviceEnrollmentOpen}
          />
          {editingDevice && (
            <DeviceEnrollmentDialog
              initialDevice={editingDevice}
              key={editingDevice.id}
              mode="edit"
              onClose={() => setEditingDevice(null)}
              onEnroll={updateDevice}
              open
            />
          )}
          <ConfirmDeleteDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={deleteProfile}
          />
          <ConfirmDeleteDialog
            description={`This will delete ${selectedServer?.name ?? "this server"}.`}
            onConfirm={handleDeleteServer}
            onOpenChange={setIsDeleteServerDialogOpen}
            open={isDeleteServerDialogOpen}
            title="Delete server?"
          />
          <ConfirmDeleteDialog
            description={`This will remove ${deviceToRemove?.name ?? "this device"} and revoke its certificate.`}
            onConfirm={removeDevice}
            onOpenChange={(open) => { if (!open) setDeviceToRemove(null); }}
            open={deviceToRemove !== null}
            title="Remove device?"
          />
        </div>
      </section>
    </main>
  );
}
