"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  Code,
  Eye,
  ImageIcon,
} from "lucide-react";

interface RestrictAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestrictAccountDialog({
  open,
  onOpenChange,
}: RestrictAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Restrict account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Select defaultValue="14px">
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder="14px" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            className="min-h-[200px]"
            defaultValue={`Hi [Customer name]

We noticed some unacceptable activities with your account which are against our terms of service. So your account has been restricted for 30 days.
Please review our guidelines to ensure compliance.

If such activities persist it will lead to permanent restriction of your account

XYZ team`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Restrict Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
