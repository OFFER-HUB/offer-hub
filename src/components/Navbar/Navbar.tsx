import React from "react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
    logo: string;
    links: { name: string; href: string}[];
    user: {
        name: string;
        profilePicture: string;
    }
}

const Navbar: React. FC<NavbarProps> = ({ logo, links, user }) => {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md md:px-12">
            {/* Logo */}
            <div className="flex items-center">

                <Image src={logo} alt="Logo" width={50} height={50} />

            </div>

            {/* Navigation Links */}
            <ul className="hidden space-x-6 md:flex">
                {links.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="text-gray-700 hover:text-blue-500 transition-colors" />
                      {link.name}
                    </li>
                ))}
            </ul>

            {/* User profile section */}
            <div className="flex items-center space-x-4">
                <Image
                    src={user.profilePicture}
                    alt={`${user.name}'s profile picture`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                 />
                 <span className="hidden text-gray-700 md:block">{user.name}</span>
                 <Link href="/signout" className="text-sm text-red-500 hover:underline" />
                    Sign Out
            </div>

            {/* Mobile menu button */}
            <button
             className="block md:hidden"
             aria-label="Toggle navigation menu" 
             />

             <svg 
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
             >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                />
             </svg>
        </nav>
    )
}

export default Navbar;