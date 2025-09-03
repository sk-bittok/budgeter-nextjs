import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserSettings } from "@/app/actions/user-settings";
import { Button } from "@/components/ui/button";
import HistoryCard from "../_components/history";
import Overview from "../_components/overview";
import CreateTransactionModal from "../transactions/_components/create-transaction";

export default async function DashboardPage() {
  const userSettings = await getUserSettings();

  if (!userSettings) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-6 py-4 container mx-auto">
          <Image
            src={"/logo1.svg"}
            alt="Company Logo"
            width={24}
            height={16}
            className="w-40 h-20 object-contain"
          />

          <div className="flex items-center gap-4">
            <CreateTransactionModal type={"income"}>
              <Button className="flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-500">
                <Plus className="w-5 h-5" />
                <span>Add Income</span>
              </Button>
            </CreateTransactionModal>

            <CreateTransactionModal type={"expense"}>
              <Button className="flex items-center gap-1 bg-rose-600 text-white hover:bg-rose-500">
                <Minus className="w-5 h-5" />
                <span>Record Expense</span>
              </Button>
            </CreateTransactionModal>
          </div>
        </div>
      </div>
      <>
        <Overview userSettings={userSettings} />
        <HistoryCard userSettings={userSettings} />
      </>
    </div>
  );
}
