"use client";
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Circle, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Memoized password strength criteria
  const strengthCriteria = useMemo(
    () => ({
      isLengthValid: password.length >= 8,
      hasUpperLowerOrNumber: /[A-Za-z0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }),
    [password]
  );

  const { isLengthValid, hasUpperLowerOrNumber, hasSpecialChar } =
    strengthCriteria;
  const passwordsMatch = password === confirmPassword;
  const isButtonDisabled = !(
    isLengthValid &&
    hasUpperLowerOrNumber &&
    hasSpecialChar &&
    passwordsMatch
  );

  // Determine strength level
  const getStrength = () => {
    let strength = 0;
    if (isLengthValid) strength++;
    if (hasUpperLowerOrNumber) strength++;
    if (hasSpecialChar) strength++;
    if (strength === 3) return "Strong";
    if (strength >= 1) return "Medium";
    return "Weak";
  };

  function handlePasswordChange() {
    router.replace("/onboarding/login");
  }

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md sm:max-w-lg lg:max-w-xl py-4 px-4 sm:px-6 lg:px-8 h-fit">
        <CardHeader className="text-center">
          <CardTitle className="font-mono font-bold text-lg sm:text-xl text-[#002333]">
            Reset your password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter password
            </label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                aria-label="Enter new password"
                className="focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-400 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#B4B9C9]" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#B4B9C9]" />
                )}
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-neutral-600">
                Strength:{" "}
                <span className="text-gray-500 font-light">
                  {getStrength()}
                </span>
              </p>
              <ul className="text-xs sm:text-sm mt-1 space-y-1">
                <li
                  className={`flex items-center text-xs sm:text-xs ${
                    isLengthValid
                      ? "text-[#00ED27]"
                      : passwordsMatch
                      ? "text-gray-600"
                      : "text-red-500"
                  }`}
                >
                  <span className="inline-flex items-center mr-2">
                    {isLengthValid ? (
                      <CircleCheck
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#00ED27]"
                        fill="currentColor"
                        stroke="white"
                      />
                    ) : (
                      <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                    )}
                  </span>
                  <span>At least 8 characters.</span>
                </li>
                <li
                  className={`flex items-center text-xs sm:text-xs ${
                    hasUpperLowerOrNumber
                      ? "text-[#00ED27]"
                      : passwordsMatch
                      ? "text-gray-600"
                      : "text-red-500"
                  }`}
                >
                  <span className="inline-flex items-center mr-2">
                    {hasUpperLowerOrNumber ? (
                      <CircleCheck
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#00ED27]"
                        fill="currentColor"
                        stroke="white"
                      />
                    ) : (
                      <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                    )}
                  </span>
                  <span>
                    At least one uppercase, lowercase characters or numbers.
                  </span>
                </li>
                <li
                  className={`flex items-center text-xs sm:text-xs ${
                    hasSpecialChar
                      ? "text-[#00ED27]"
                      : passwordsMatch
                      ? "text-gray-600"
                      : "text-red-500"
                  }`}
                >
                  <span className="inline-flex items-center mr-2">
                    {hasSpecialChar ? (
                      <CircleCheck
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#00ED27]"
                        fill="currentColor"
                        stroke="white"
                      />
                    ) : (
                      <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                    )}
                  </span>
                  <span>At least one special character.</span>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                !passwordsMatch && confirmPassword
                  ? "text-red-500"
                  : "text-gray-700"
              }`}
            >
              Enter password again
            </label>
            <div className="relative mt-1">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                aria-label="Confirm new password"
                className={`${
                  !passwordsMatch && confirmPassword ? "border-red-500" : ""
                } focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-400 text-sm sm:text-base`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#B4B9C9]" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#B4B9C9]" />
                )}
              </button>
            </div>
            {!passwordsMatch && confirmPassword && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                Password mis-match.
              </p>
            )}
          </div>
          <Button
            disabled={isButtonDisabled}
            className={`w-full ${
              isButtonDisabled
                ? "bg-[#002333] disabled:bg-[#002333] disabled:opacity-100 text-white"
                : "bg-blue-900 text-white"
            } py-2 rounded-3xl text-sm sm:text-base`}
            onClick={handlePasswordChange}
          >
            Change password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
