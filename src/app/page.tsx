import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar/Navbar";



const links = [
  { name: "Home", href: "/" },
  { name: "My Chats", href: "/chats" },
  { name: "Find Workers", href: "/workers" },
  { name: "My Account", href: "/account" },
  { name: "FAQ", href: "/faq" },
  { name: "Help", href: "/help" },
];

const user = {
  name: "John Doe",
  profilePicture: "/profile.jpg",
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="absolute top-4 right-4">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
      <div>
        <Navbar logo="/logo.svg" links={links} user={user} />
      </div>
      
      </div>
  );
}
