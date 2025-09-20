import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

function Header({ className, ...props }: Props) {
  return (
    <header
      className={`border-b bg-[#f6f6f6] border-[#6D758F] px-4 ${className}`}
      {...props}
    >
      <div className="max-w-[95%] mx-auto py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/oh-logo.png"
            alt="Offer Hub Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="text-[#002333] font-bold text-xl">OFFER HUB</span>
        </Link>

        <Button
          onClick={() => {}}
          variant="outline"
          className="border-[#002333] bg-transparent rounded-full md:min-w-36"
        >
          Sign In
        </Button>
      </div>
    </header>
  );
}

export default Header;
