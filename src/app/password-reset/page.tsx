import ResetPasswordPage from "@/components/ui/ResetPasswordPage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

// Simple Header component defined inline
function SimpleHeader() {
  return (
    <header className="border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-10">
            <Link href="/" className="flex items-center">
              <Image
                src="/oh-logo.png"
                alt="Offer Hub Logo"
                width={32}
                height={32}
                className="object-contain sm:w-10 sm:h-10"
              />
              <span className="text-[#002333] font-semibold text-lg sm:text-xl ml-2">
                OFFER HUB
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-5">
            <Button variant="ghost" size="icon" className="text-[#002333]">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                <Image
                  src="/PersonResetPassword.jpg"
                  alt="Profile Picture"
                  width={34}
                  height={34}
                  className="object-cover w-full h-full"
                />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <SimpleHeader />
      <div className="flex-grow pt-16">
        <ResetPasswordPage />
      </div>
    </div>
  );
}