import { redirect } from "next/navigation";
import React from "react";
import { useState } from "react";

const PasswordRecoveryForm = () => {
  const [email, setEmail] = useState("olivia@email.com");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Continue with email:", email);
    confirm(`Continue with email: ${email}`);
    redirect("/onboarding/check-email");
  };

  return (
    <div className="bg-[#f6f6f6] w-full h-screen flex justify-center">
      <div className=" rounded-lg bg-white w-full h-fit mx-10 mt-16 max-w-3xl py-16 px-16">
        <div className="text-center mb-16">
          <h1 className="text-2xl font-medium text-[#002333] mb-2">
            Recover your password
          </h1>
          <p className="text-[#6D758F] text-sm">
            Enter the email address or username associated with your OfferHub
            admin
            <br />
            account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-10">
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

          <div className="space-y-5">
            <button
              type="submit"
              className="w-full bg-[#19213D] text-[#F1F3F7] py-3 rounded-full font-normal"
            >
              Continue
            </button>

            <button
              type="button"
              className="w-full bg-[#149A9B] text-white py-3 rounded-full font-normal"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordRecoveryForm;
