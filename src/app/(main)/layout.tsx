"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.error("Please sign in to view this page.");
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full h-screen">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
