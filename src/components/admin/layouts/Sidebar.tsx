"use client";

import { ArrowUpIcon, BarChart3Icon, BoxIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
    path: "/admin/user-management",
    icon: <FaPlus className="h-5 w-5" />,
    label: "User management",
  },
  {
    path: "/admin/platform-monitoring",
    icon: <MdOutlineSavedSearch className="h-5 w-5" />,
    label: "Platform monitoring",
  },
  {
    path: "/admin/dispute-resolution",
    icon: <LuFolderPen className="h-5 w-5" />,
    label: "Dispute resolution",
  },
  {
    path: "/admin/profile",
    icon: <UsersIcon className="h-5 w-5" />, // Puedes cambiar el icono si tienes uno más adecuado
    label: "Profile",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="w-64 border-r bg-gray-50">
      <div className="flex items-center gap-2 p-6">
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
            active={pathname === item.path}
          />
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 border-t p-3">
        <NavItem
          icon={<ArrowUpIcon className="h-5 w-5 rotate-90" />}
          label="Logout"
          className="text-red-500"
          path="/logout"
        />
      </div>
    </div>
  );
}
