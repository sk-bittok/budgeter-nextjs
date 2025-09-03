import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}
