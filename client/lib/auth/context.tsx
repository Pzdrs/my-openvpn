"use client";

import { createContext, useContext, useState } from "react";
import { CookieName } from "../enum";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
}

