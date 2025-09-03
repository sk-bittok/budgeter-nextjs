import type { ReactNode } from "react";

export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex relative h-screen w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}
