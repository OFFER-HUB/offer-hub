"use client";

import { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function SearchBar({ ...props }: SearchBarProps) {
  return (
    <div
      className="flex items-center px-4 py-2 rounded-[23.5px] border border-[#DEEFE7] bg-[#DEEFE7] w-[393px] h-[47px]"
    >
      <input
        type="text"
        className="flex-grow bg-transparent outline-none text-[#002333] placeholder:text-[#B4BEC9] text-sm"
        placeholder="Designer, developer..."
        {...props}
      />
      <Search className="text-[#B4BEC9] w-5 h-5" />
    </div>
  );
}
