"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  });

  return (
    <div className="container mx-auto">
      <div className="px-4 py-2">
        <h1 className="text-3xl font-bold">Smart Spender</h1>
        <p>
          You are being redirected to your{" "}
          <a
            href="/dashboard"
            className="text-blue-500 visited:text-purple-500"
          >
            dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
