import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

interface SecuritySettingsProps {
  onBack: () => void;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperLowerNumber: boolean;
  hasSpecialChar: boolean;
}

export default function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (password: string): PasswordStrength => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperLowerNumber:
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) ||
        /(?=.*[a-z])(?=.*\d)/.test(password) ||
        /(?=.*[A-Z])(?=.*\d)/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUpperLowerNumber &&
    passwordStrength.hasSpecialChar &&
    passwordsMatch &&
    formData.confirmPassword !== "";

  const getStrengthText = () => {
    const validCount = Object.values(passwordStrength).filter(Boolean).length;
    if (validCount === 0) return "";
    if (validCount === 1) return "Weak";
    if (validCount === 2) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFormData({ password: "", confirmPassword: "" });
      onBack();
    }, 1000);
  };

  return (
    <div className="relative h-full w-full">
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute left-4 top-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>
      <div className="pt-20 pb-6 px-6 h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-12 text-center">
              Reset your password
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-8 max-w-lg mx-auto"
            >
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Enter password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="h-12 pr-10"
                    placeholder="••••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {formData.password && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Strength:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            passwordStrength.hasMinLength
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-gray-600">
                          At least 8 characters.
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            passwordStrength.hasUpperLowerNumber
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-gray-600">
                          At least one uppercase, lowercase characters or
                          numbers
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            passwordStrength.hasSpecialChar
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-gray-600">
                          At least one special characters
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-red-600 mb-2 block"
                >
                  Enter password again
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={`h-12 pr-10 ${
                      formData.confirmPassword && !passwordsMatch
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="••••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-red-600 mt-2">
                    Password mis-match.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full h-12 bg-[#002333] hover:bg-[#001a26] text-white font-medium rounded-full"
              >
                {isLoading ? "Changing..." : "Change password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
