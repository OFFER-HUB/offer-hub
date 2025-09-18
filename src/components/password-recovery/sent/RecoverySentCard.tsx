"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RecoverySentCard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 pt-32 overflow-hidden">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 text-center">
          <div className="relative mb-4">
            <div className="h-24 w-24">
              <Image
                src="/email.png"
                alt="Email Icon"
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            We&apos;ve sent an email with the next steps, check your inbox and
            follow along.
          </p>
          <Button
            asChild
            className="w-full !rounded-full bg-[#003049] text-white hover:bg-[#00436a] py-2"
          >
            <Link href="/signup">Sign up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
