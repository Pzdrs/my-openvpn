"use client";

import { ConfirmDeleteDialog } from "@/components/dialog/alert-dialog-destructive";
import Header from "@/components/Header";
import ProfileEditorDialog, {
  ProfileEditorState,
} from "@/components/modal/profile-editor-dialog";
import ServerEditorDialog from "@/components/modal/server-editor-dialog";
import NoProfileCard from "@/components/no-profile-card";
import NoServersCard from "@/components/no-servers-card";
import ProfileCard from "@/components/profile-card";
import ServerSelector from "@/components/server-selector";
import { useTheme } from "@/components/theme-provider";
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
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

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

  return (
    <main
      className={`vpn-dashboard relative min-h-screen overflow-hidden bg-[#f6f8fb] px-4 py-7 sm:px-6 sm:py-12 ${darkMode ? "dark" : ""}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(186,230,253,0.42),_transparent_68%)]" />
      <section className="relative mx-auto w-full max-w-[610px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_22px_70px_-28px_rgba(15,23,42,0.24)]">
        <Header />
        <div className="px-6 pb-7 pt-8 sm:px-8 sm:pb-9">
          {servers.length > 0 ? (
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
            <>
              <div className="mb-8 flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                  <ShieldCheck className="size-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Your secure connection
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Manage the OpenVPN profile and devices registered to your
                    account in {selectedServer.name}.
                  </p>
                </div>
              </div>
              <section
                aria-labelledby="profile-heading"
                className="rounded-2xl border border-slate-200 bg-slate-50/65 p-4 sm:p-5"
              >
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
              </section>
              <section aria-labelledby="devices-heading" className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2
                      id="devices-heading"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Registered devices
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {/* {selectedServer.devices.length} of{" "}
                      {selectedServer.deviceLimit} devices in use */}
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                  {/* {selectedServer.devices.length > 0 ? (
                    selectedServer.devices.map(
                      ({ name, detail, icon: Icon, current }) => (
                        <div
                          className="flex items-center gap-3.5 px-4 py-3.5"
                          key={name}
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                            <Icon className="size-[17px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {name}
                              </p>
                              {current && (
                                <span
                                  aria-label="Currently active"
                                  className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                                />
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {detail}
                            </p>
                          </div>
                          <Button
                            aria-label={`Options for ${name}`}
                            className="text-slate-400 hover:text-slate-700"
                            size="icon-xs"
                            variant="ghost"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No devices registered
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Devices added to {selectedServer.name} will appear here.
                      </p>
                    </div>
                  )} */}
                </div>
              </section>
              <footer className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400">
                <span>Viewing {selectedServer.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> All
                  systems operational
                </span>
              </footer>
            </>
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
        </div>
      </section>
    </main>
  );
}
