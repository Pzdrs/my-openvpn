"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DtoUser, getMe, logout as _logout } from "../api/client";
import { Route } from "../route";
import { Spinner } from "@/components/ui/spinner";
import { ok } from "@oazapfts/runtime";

interface AuthContextType {
  user: DtoUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DtoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ok(getMe())
      .then((user) => {
        setUser(user);
        console.log("Authenticated user:", user);
      })
      .catch(() => {
        setUser(null);
        window.location.href = Route.login();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = async () => {
    await _logout();
    window.location.href = Route.login(); 
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  const contextValue: AuthContextType = {
    user,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
