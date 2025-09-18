"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingPage from "@/components/client-onboarding/LandingPage";
import ConnectWallet from "@/components/client-onboarding/ConnectWallet";
import SignIn from "@/components/client-onboarding/SignIn";
import SignInAccountNotFound from "@/components/client-onboarding/SignInAccountNotFound";
import EnterPassword from "@/components/client-onboarding/EnterPassword";
import RecoverPassword from "@/components/client-onboarding/RecoverPassword";
import CheckEmail from "@/components/client-onboarding/CheckEmail";
import ResetPassword from "@/components/client-onboarding/ResetPassword";

export type OnboardingStep =
  | "landing"
  | "connect-wallet"
  | "sign-in"
  | "sign-in-not-found"
  | "enter-password"
  | "recover-password"
  | "check-email"
  | "reset-password";

interface OnboardingState {
  currentStep: OnboardingStep;
  email?: string;
  password?: string;
  walletAddress?: string;
  userRole?: "client" | "freelancer";
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
const OnboardingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<OnboardingState>({
    currentStep: "landing",
  });

  useEffect(() => {
    const step = searchParams.get("step") as OnboardingStep;
    const email = searchParams.get("email");
    const role = searchParams.get("role") as "client" | "freelancer";

    if (step && isValidStep(step)) {
      setState((prev) => ({
        ...prev,
        currentStep: step,
        email: email || prev.email,
        userRole: role || prev.userRole,
      }));
    }
  }, [searchParams]);

  const isValidStep = (step: string): step is OnboardingStep => {
    return [
      "landing",
      "connect-wallet",
      "sign-in",
      "sign-in-not-found",
      "enter-password",
      "recover-password",
      "check-email",
      "reset-password",
    ].includes(step);
  };

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const navigateToStep = (step: OnboardingStep) => {
    updateState({ currentStep: step });
    const url = new URL(window.location.href);
    url.searchParams.set("step", step);
    window.history.pushState({}, "", url.toString());
  };

  const handleLandingAction = (action: "sign-up" | "sign-in") => {
    if (action === "sign-up") {
      navigateToStep("connect-wallet");
    } else {
      navigateToStep("sign-in");
    }
  };

  const handleWalletConnected = (walletAddress: string) => {
    updateState({ walletAddress });
    navigateToStep("sign-in");
  };

  const handleSignIn = (
    method: "apple" | "google" | "email",
    data?: { email: string; password?: string }
  ) => {
    if (data?.email) {
      updateState({ email: data.email });
    }

    const accountExists = Math.random() > 0.5;

    if (accountExists) {
      navigateToStep("enter-password");
    } else {
      navigateToStep("sign-in-not-found");
    }
  };

  const handlePasswordSubmit = (password: string) => {
    updateState({ password });
    router.push("/dashboard");
  };

  const handleCreateAccount = () => {
    navigateToStep("sign-in");
  };

  const handleRecoverPassword = (email: string) => {
    updateState({ email });
    navigateToStep("check-email");
  };

  const handleResetPassword = (newPassword: string) => {
    updateState({ password: newPassword });
    navigateToStep("sign-in");
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case "landing":
        return <LandingPage onAction={handleLandingAction} />;

      case "connect-wallet":
        return <ConnectWallet onWalletConnected={handleWalletConnected} />;

      case "sign-in":
        return (
          <SignIn
            email={state.email}
            onSignIn={handleSignIn}
            onRecoverPassword={() => navigateToStep("recover-password")}
          />
        );

      case "sign-in-not-found":
        return (
          <SignInAccountNotFound
            email={state.email}
            onCreateAccount={handleCreateAccount}
            onSignIn={() => navigateToStep("enter-password")}
          />
        );

      case "enter-password":
        return (
          <EnterPassword
            email={state.email}
            onPasswordSubmit={handlePasswordSubmit}
            onRecoverPassword={() => navigateToStep("recover-password")}
            onBack={() => navigateToStep("sign-in")}
          />
        );

      case "recover-password":
        return (
          <RecoverPassword
            email={state.email}
            onRecoverPassword={handleRecoverPassword}
            onBack={() => navigateToStep("sign-in")}
          />
        );

      case "check-email":
        return (
          <CheckEmail
            email={state.email}
            onBackToSignIn={() => navigateToStep("sign-in")}
          />
        );

      case "reset-password":
        return (
          <ResetPassword
            onResetPassword={handleResetPassword}
            onBack={() => navigateToStep("sign-in")}
          />
        );

      default:
        return <LandingPage onAction={handleLandingAction} />;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderCurrentStep()}</div>;
};

// Main component that wraps OnboardingContent in Suspense
const OnboardingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
};

export default OnboardingPage;
