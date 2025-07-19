import React from "react";
import MailImg from "../../../public/mail.png";
import Image from "next/image";
import Link from "next/link";

const CheckEmailBox = () => {
  return (
    <section className="bg-[#f6f6f6] w-full h-screen flex justify-center">
      <div className="my-16 md:mt-16 bg-white p-[16px] rounded-[16px] w-[90vw] sm:h-[70vh] md:min-h-[70vh] lg:h-[70vh] sm:w-[70vw] md:w-[60vw] lg:w-[60vw]">
        {/* MailBox Image */}
        <div className="flex-1 h-full flex flex-col items-center justify-center">
          <Image src={MailImg} width={200} height={200} alt="Mail" />

          {/* Main Text */}
          <h2 className="mt-5 font-bold text-[24px] sm:text-[20px] md:text-[24px]">
            Check your email
          </h2>

          {/* Paragraph */}
          <p className="mb-10 font-semibold text-[#6D758F] text-center text-[16px] sm:text-[14px] md:text-[16px]">
            We've sent an email with the next steps, check your inbox and follow
            along.
          </p>

          {/* Redirect button */}
          <Link
            href="/onboarding/login"
            className="md:w-[50%] px-16 bg-[#19213D] text-[#F1F3F7] py-3 rounded-full font-normal text-[16px] sm:px-8 sm:text-[14px]"
          >
            <button type="submit" className="w-full">
              Return to login
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CheckEmailBox;
