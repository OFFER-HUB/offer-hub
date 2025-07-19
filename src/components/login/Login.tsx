"use client";

import Link from "next/link";
import React, { useState } from "react";

const LoginForm = () => {
  const [email, setEmail] = useState("olivia@email.com");
  const [password, setPassword] = useState("**********");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Sign in with:", { email, password, keepLoggedIn });
  };

  return (
    <div className="bg-[#f6f6f6] w-full h-screen flex justify-center">
      <div className="rounded-lg bg-white w-full h-fit mx-10 mt-16 max-w-3xl py-16 px-16">
        <div className="text-center mb-16">
          <h1 className="text-2xl font-medium text-[#002333] mb-8">
            Welcome back
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-[#344054] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-md py-2 px-3 text-[#667085]"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-[#344054] mb-2">
              Enter password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md py-2 px-3 text-[#667085]"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => console.log("Toggle password visibility")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                    fill="#D0D5DD"
                    stroke="#D0D5DD"
                    strokeWidth="0.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center mb-8">
            <input
              id="keep-logged-in"
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="h-4 w-4 text-[#19213D] border-gray-300 rounded"
            />
            <label
              htmlFor="keep-logged-in"
              className="ml-2 text-sm text-[#344054]"
            >
              Keep me Logged in.
            </label>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-[#19213D] text-white py-3 rounded-full font-normal"
            >
              Sign in
            </button>

            <div className="text-center">
              <Link
                href="/onboarding/password-recovery"
                className="text-[#FF2000] text-sm font-normal"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
