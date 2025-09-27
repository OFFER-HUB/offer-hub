"use client";

import { ArrowUpIcon, UsersIcon, Settings } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import NavItem from "../components/NavItems";
import { LuFolderPen } from "react-icons/lu";
import { MdDashboard, MdOutlineSavedSearch } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

const navItems = [
  {
    path: "/admin",
    icon: <MdDashboard className="h-5 w-5" />,
    label: "Dashboard",
  },
  {
    path: "/user-management",
    icon: <FaPlus className="h-5 w-5" />,
    label: "User management",
  },
  {
    path: "/platform-monitoring",
    icon: <MdOutlineSavedSearch className="h-5 w-5" />,
    label: "Platform monitoring",
  },
  {
    path: "/dispute-resolution",
    icon: <LuFolderPen className="h-5 w-5" />,
    label: "Dispute resolution",
  },
  {
    path: "/admin/configuration",
    icon: <Settings className="h-5 w-5" />,
    label: "Configuration",
  },
  {
    path: "/profile",
    icon: <UsersIcon className="h-5 w-5" />,
    label: "Profile",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Function to check if a path is active (exact match or is a subpath)
  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') {
      return true;
    }
    // For other paths, check if the current pathname starts with the nav item path
    // but only if it's not the root admin path
    return path !== '/admin' && pathname.startsWith(path);
  };

  return (
    <div className="w-64 border-r bg-gray-50">
      <div 
        className="flex items-center gap-2 p-6 cursor-pointer" 
        onClick={() => {
          router.push('/admin');
        }}
      >
        <Image src="/logo.svg" alt="Offer Hub Logo" width={32} height={32} />
        <h1 className="text-xl font-bold">Offer Hub</h1>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={isActive(item.path)}
          />
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 border-t p-3">
        <NavItem
          icon={<ArrowUpIcon className="h-5 w-5 rotate-90" />}
          label="Logout"
          className="text-red-500"
          path="/"
        />
      </div>
    </div>
  );
}
