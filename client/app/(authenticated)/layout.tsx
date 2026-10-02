import { AuthProvider } from "@/lib/auth/context";

export default function AuthenticatedLayout({ children }: LayoutProps<"/">) {
  return <AuthProvider>{children}</AuthProvider>;
}
