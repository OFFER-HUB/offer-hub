"use client"

import React, { useMemo, useState } from 'react';

import { useWalletContext } from "@/components/onboarding/WalletContext";
import { CreateUserDTO } from "@/types/user.types";

interface SignInFormProps {
  email?: string;
  onEmailChange?: (email: string) => void;
  onSignIn: (method: 'apple' | 'google' | 'email', data?: { email: string; password?: string }) => void;
  showSocialAuth?: boolean;
  showEmailAuth?: boolean;
  showPasswordField?: boolean;
  disabled?: boolean;
  className?: string;
  onRegister?: (data: CreateUserDTO) => void;
  isRegistering?: boolean;
  backendError?: string | null;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email: initialEmail = "",
  onEmailChange,
  onSignIn,
  showSocialAuth = true,
  showEmailAuth = true,
  showPasswordField = false,
  disabled = false,
  className = "",
  onRegister,
  isRegistering = false,
  backendError = null,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { address: walletAddress } = useWalletContext();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(false);

  const canRegister = useMemo(() => {
    return Boolean(walletAddress && username.trim());
  }, [walletAddress, username]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    onEmailChange?.(newEmail);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn('email', { email, password: showPasswordField ? password : undefined });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRegister) return;
    if (!walletAddress || !username.trim()) return;
    const payload: CreateUserDTO = {
      wallet_address: walletAddress,
      username: username.trim(),
      name: name.trim() || undefined,
      bio: bio.trim() || undefined,
      email: profileEmail.trim() || undefined,
      is_freelancer: isFreelancer,
    };
    onRegister(payload);
  };



  const EyeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {showSocialAuth && (
        <>
          <button
            onClick={() => onSignIn('apple')}
            disabled={disabled}
            className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative"
          >
            <div className="absolute left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
            </div>
            Apple
          </button>
          <button
            onClick={() => onSignIn('google')}
            disabled={disabled}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative"
          >
            <div className="absolute left-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            Google
          </button>

          {showEmailAuth && (
            <div className="text-center text-gray-500 text-sm">Or</div>
          )}
        </>
      )}

      {showEmailAuth && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="signin-email" className="block text-sm font-medium text-[#344054] mb-2">
              Email
            </label>
            <input
              type="email"
              id="signin-email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
              placeholder="olivia@email.com"
              required
            />
          </div>

          {showPasswordField && (
            <div>
              <label htmlFor="signin-password" className="block text-sm font-medium text-[#344054] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={disabled}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={disabled}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={disabled || !email.trim()}
            className="w-full bg-[#002333] text-white py-2 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#19213D] focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      )}

      <div className="text-center text-gray-500 text-sm">Or create an account</div>

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#344054] mb-2">Wallet address</label>
          <input
            type="text"
            value={walletAddress || ""}
            readOnly
            className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-[#667085]"
            placeholder="Connect your wallet first"
          />
          {!walletAddress && (
            <p className="text-xs text-red-600 mt-1">Wallet connection required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#344054] mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={disabled || isRegistering}
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
            placeholder="yourusername"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#344054] mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled || isRegistering}
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#344054] mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={disabled || isRegistering}
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#344054] mb-2">Email (optional)</label>
          <input
            type="email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            disabled={disabled || isRegistering}
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isFreelancer"
            type="checkbox"
            checked={isFreelancer}
            onChange={(e) => setIsFreelancer(e.target.checked)}
            disabled={disabled || isRegistering}
            className="h-4 w-4"
          />
          <label htmlFor="isFreelancer" className="text-sm text-[#344054]">I am a freelancer</label>
        </div>

        {backendError && (
          <div className="text-sm text-red-600">{backendError}</div>
        )}

        <button
          type="submit"
          disabled={disabled || isRegistering || !canRegister}
          className="w-full bg-[#149A9B] text-white py-2 px-4 rounded-full font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#149A9B] focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          {isRegistering && (
            <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Create account
        </button>
      </form>
    </div>
  );
};

export default SignInForm;
