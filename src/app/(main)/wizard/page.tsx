"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import CurrencySelector from "@/components/currency-box";
import TimezoneSelector from "@/components/timezone-box";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserSettings } from "@/generated/prisma";

export default function WizardPage() {
  const { user, isLoaded } = useUser();

  const { data: userSettings, isFetching } = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl text-center">
          Welcome&nbsp;
          <span className="font-bold capitalize">
            {isLoaded ? user?.firstName : "Back"}
          </span>
        </h1>
        <p className="mt-4 text-center text-base text-muted-foreground">
          Let&apos;s get started by setting your prefered currency and timezone.
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          You can change this later in your profile settings at any time.
        </p>
      </div>
      <Separator />
      <Card className="w-full">
        <CardHeader className="flex items-center justify-center flex-col">
          <CardTitle className="text-3xl tracking-tighter font-bold">
            User Preferences
          </CardTitle>
          <CardDescription>Set your currency and location.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <CurrencySelector
            userSettings={userSettings}
            isLoading={isFetching}
          />
          <TimezoneSelector
            userSettings={userSettings}
            isLoading={isFetching}
          />
        </CardContent>
      </Card>
      <Separator />
      <Button type="button" className="w-full" asChild>
        <Link href={"/dashboard"}>
          I&apos;m finished. Take me to the dashboard.
        </Link>
      </Button>
    </div>
  );
}
