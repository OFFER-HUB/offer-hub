"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RoleSelector from "@/components/auth/RoleSelector";
import SignInForm from "@/components/auth/SignInForm";
import { TIMEOUTS } from "@/constants/magic-numbers";

// Component that uses useSearchParams - needs to be wrapped in Suspense
const SignInNotFoundContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rejectedEmail = searchParams.get("email") || "AdebayoDoe@yahoo.com";
  const [email, setEmail] = useState(rejectedEmail);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: "freelancer" | "client") => {
    setIsLoading(true);
    router.push(
      `/onboarding/sign-up?role=${role}&email=${encodeURIComponent(email)}`
    );
  };

  const handleSignIn = (
    method: "apple" | "google" | "email",
    data?: { email: string; password?: string }
  ) => {
    setIsLoading(true);

    switch (method) {
      case "apple":
        console.log("Signing in with Apple");
        break;
      case "google":
        console.log("Signing in with Google");
        break;
      case "email":
        if (data?.email) {
          console.log("Attempting sign in with email:", data.email);
        }
        break;
    }

    setTimeout(() => setIsLoading(false), TIMEOUTS.API_DELAY_VERY_LONG);
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
  };

  const handleCreateAccount = () => {
    setIsLoading(true);
    router.push(`/onboarding/sign-up?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="bg-[#F1F3F7] rounded-xl p-4 mb-6">
          <RoleSelector
            email={rejectedEmail}
            onRoleSelect={handleRoleSelect}
            className=""
          />
        </div>

        <SignInForm
          email={email}
          onEmailChange={handleEmailChange}
          onSignIn={handleSignIn}
          showSocialAuth={true}
          showEmailAuth={true}
          showPasswordField={false}
          disabled={isLoading}
          className="mb-20"
        />
      </div>
    </div>
  );
};

// Main component that wraps SignInNotFoundContent in Suspense
const SignInNotFoundPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SignInNotFoundContent />
    </Suspense>
  );
};

export default SignInNotFoundPage;
