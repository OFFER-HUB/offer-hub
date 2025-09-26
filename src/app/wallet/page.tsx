"use client"

import { PublicRoute } from "@/components/auth/public-route";
import WalletConnectPage from "../../components/onboarding/ConnectWalletPage";

export default function WalletPage() {
   return (
      <PublicRoute>
         <WalletConnectPage />
      </PublicRoute>
   );
}