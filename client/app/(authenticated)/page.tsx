"use client";

import Header from "@/components/Header";
import NoProfileCard from "@/components/no-profile-card";
import NoServersCard from "@/components/no-servers-card";
import ProfileCard from "@/components/profile-card";
import ServerSelector from "@/components/server-selector";
import { useTheme } from "@/components/theme-provider";
import { DtoServer, getUserServers } from "@/lib/api/client";
import {
  FileKey2,
  Laptop,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";

type Device = {
  name: string;
  detail: string;
  icon: typeof Laptop;
  current: boolean;
};

type EnvironmentServer = {
  id: string;
  name: string;
  description: string;
  hasProfile: boolean;
  deviceLimit: number;
  devices: Device[];
};

// Frontend placeholders until server and profile endpoints are available.
const servers: EnvironmentServer[] = [
  {
    id: "production",
    name: "Production",
    description: "Live environment",
    hasProfile: true,
    deviceLimit: 5,
    devices: [
      {
        name: "MacBook Pro",
        detail: "macOS · Last seen today",
        icon: Laptop,
        current: true,
      },
      {
        name: "iPhone 15 Pro",
        detail: "iOS · Last seen today",
        icon: Smartphone,
        current: false,
      },
      {
        name: "ThinkPad X1",
        detail: "Windows · Last seen Sep 22",
        icon: MonitorSmartphone,
        current: false,
      },
    ],
  },
  {
    id: "staging",
    name: "Staging",
    description: "Pre-release testing",
    hasProfile: false,
    deviceLimit: 3,
    devices: [
      {
        name: "MacBook Pro",
        detail: "macOS · Last seen yesterday",
        icon: Laptop,
        current: true,
      },
    ],
  },
  {
    id: "development",
    name: "Development",
    description: "Development environment",
    hasProfile: false,
    deviceLimit: 3,
    devices: [],
  },
];

export default function Home() {
  const [servers, setServers] = useState<DtoServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState(
    servers.length > 0 ? servers[0].id : 0,
  );

  useEffect(() => {
    async function fetchServers() {
      getUserServers()
        .then((response) => {
          setServers(response);
          if (response.length > 0) {
            setSelectedServerId(response[0].id);
          }
        })
        .catch((error) => {
          console.error("Error fetching servers:", error);
        });
    }

    fetchServers();
  }, []);

  const { darkMode } = useTheme();
  const selectedServer = servers.find(
    (server) => server.id === selectedServerId,
  );

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
            />
          ) : (
            <NoServersCard />
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
                  <ProfileCard server={selectedServer} />
                ) : (
                  <NoProfileCard server={selectedServer} />
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
        </div>
      </section>
    </main>
  );
}
