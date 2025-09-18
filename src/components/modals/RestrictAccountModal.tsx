"use client";
import * as React from "react";
import {
  Bold,
  FileText,
  Link2 as Link,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code2,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const DEFAULT_WARNING_MESSAGE = `Hi [Customer name]

We noticed some unacceptable activities with your account which are against our terms of service. So your account has been restricted for 30 days. Please review our guidelines to ensure compliance.

If such activities persist it will lead to permanent restriction of your account

XYZ team`;

function RestrictAccountModal() {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="flex justify-between items-center">
          <DialogTitle className="font-normal">Restrict account</DialogTitle>
          <DialogClose className="h-4 w-4 opacity-70 transition-opacity hover:opacity-100" />
        </div>

        <div className="mt-4">
          {/* Toolbar */}
          <div className="flex items-center border rounded-md p-1 mb-2">
            <div className="flex items-center border rounded px-1 py-0.5 hover:bg-slate-100 cursor-pointer mr-1">
              <span className="text-xs mr-1 text-gray-500">14px</span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </div>

            {/* Text formatting */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-1 hover:bg-slate-100"
            >
              <Bold className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-1 hover:bg-slate-100 flex items-center gap-0.5"
            >
              <span className="text-gray-500 font-medium">A</span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-1 hover:bg-slate-100"
            >
              <FileText className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-1 hover:bg-slate-100"
            >
              <Link className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-1 hover:bg-slate-100"
            >
              <Video className="h-4 w-4 text-gray-500" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Alignment */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-2 hover:bg-slate-100"
            >
              <AlignLeft className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-2 hover:bg-slate-100"
            >
              <AlignCenter className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-2 hover:bg-slate-100"
            >
              <AlignRight className="h-4 w-4 text-gray-500" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Code and Preview */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-2 hover:bg-slate-100"
            >
              <Code2 className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-2 hover:bg-slate-100"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          {/* Text area */}
          <Textarea
            value={DEFAULT_WARNING_MESSAGE}
            className="min-h-[200px] resize-none font-normal"
            readOnly
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" className="rounded-full">
            Cancel
          </Button>
          <Button variant="destructive" className="rounded-full">
            Restrict Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RestrictAccountModal;
