"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getUserSettings } from "@/app/actions/user-settings";
import CurrencySelector from "@/components/currency-box";
import TimezoneSelector from "@/components/timezone-box";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategoryList from "../_components/category-list";

export default function SettingsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, isLoaded, router]);

  const { data: userSettings, isFetching } = useQuery({
    queryFn: () => getUserSettings(user!.id),
    queryKey: ["user-settings", user?.id],
    enabled: isLoaded && isSignedIn && !!user,
  });

  useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      user &&
      userSettings === null &&
      !isFetching
    ) {
      router.push("/wizard");
    }
  }, [isLoaded, isSignedIn, user, userSettings, isFetching, router]);

  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto">
          <div>
            <h2 className="text-3xl font-bold">Manage</h2>
            <p className="text-muted-foreground">
              Manage account settings and categories
            </p>
          </div>
        </div>
      </div>
      <div className="container flex flex-col gap-4 p-4 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Set your default currency for transactions and prefered timezone
            </CardDescription>
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
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  );
}
