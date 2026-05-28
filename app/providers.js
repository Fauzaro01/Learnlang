"use client";

import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { SocketProvider } from "@/lib/socket-provider";
import SessionGuard from "@/components/SessionGuard";
import DashboardLayout from "@/components/DashboardLayout";

const excludedPaths = ["/", "/login", "/register", "/about"];

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <SessionGuard />
        <ProvidersContent>{children}</ProvidersContent>
      </SocketProvider>
    </SessionProvider>
  );
}

function ProvidersContent({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const showDashboard =
    Boolean(session) &&
    pathname &&
    !excludedPaths.includes(pathname) &&
    !pathname.startsWith("/admin");

  return showDashboard ? <DashboardLayout>{children}</DashboardLayout> : <>{children}</>;
}
