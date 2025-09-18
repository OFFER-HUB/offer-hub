"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";

export interface ProjectCardProps {
  title?: string;
  person?: string;
  freelancerName?: string;
  date?: string;
  dateRange?: string;
  avatarSrc?: string;
  freelancerAvatar?: string;
  menuIcon?: React.ReactNode;
  onMessage?: () => void;
  showDropdownMenu?: boolean;
}

export function ProjectCard({
  title = "Project title",
  person,
  freelancerName,
  date,
  dateRange,
  avatarSrc,
  freelancerAvatar,
  menuIcon,
  onMessage,
  showDropdownMenu = true,
}: ProjectCardProps) {
  const displayTitle = title;
  const displayPerson = person || freelancerName || "Freelancer Name";
  const displayDate = date || dateRange || "Today";
  const displayAvatar =
    avatarSrc || freelancerAvatar || "/placeholder.svg?height=40&width=40";

  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] sm:text-base font-semibold text-slate-800 leading-6 line-clamp-1">
              {displayTitle}
            </h3>

            <div className="mt-3 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayAvatar} alt={displayPerson} />
                <AvatarFallback>
                  {displayPerson?.[0]?.toUpperCase() || "F"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p className="font-medium text-slate-700">{displayPerson}</p>
                <p className="text-xs text-slate-500">{displayDate}</p>
              </div>
            </div>
          </div>

          {showDropdownMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-md p-2 hover:bg-slate-100 text-gray-500 hover:text-gray-700">
                {menuIcon || <Ellipsis className="w-5 h-5" />}
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  Report issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-4">
          <Button
            onClick={onMessage}
            className="w-full rounded-full bg-[#002333] hover:bg-[#012b3f] text-white"
            variant="default"
          >
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
