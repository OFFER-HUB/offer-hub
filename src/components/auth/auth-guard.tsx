"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ReactNode } from "react";
import LoadingSpinner from "../ui/loading-spinner";
import { AccessDenied } from "./AccessDenied";

interface AuthGuardProps {
  children: ReactNode;
  roles?: string[];
}

export const AuthGuard = ({ children, roles }: AuthGuardProps) => {
  const { isLoading, hasAccess, error, isAuthenticated } = useAuthGuard(roles);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center flex-col justify-center gap-3 ">
        <LoadingSpinner />
        <span className=" text-teal-600">Verifying access…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center gap-3 ">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return "Please get authenticated";
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <> {children} </>;
};
