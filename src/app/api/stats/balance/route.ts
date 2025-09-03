import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { dateToUTCDate } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!to || !from) {
    throw new Error("Select a period.");
  }

  const stats = await getBalanceStats(
    user.id,
    dateToUTCDate(new Date(from)),
    dateToUTCDate(new Date(to)),
  );

  return Response.json(stats);
}

async function getBalanceStats(userId: string, from: Date, to: Date) {
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId: userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
    income: totals.find((t) => t.type === "income")?._sum.amount || 0,
  };
}

export type GetBalanceStatsType = Awaited<ReturnType<typeof getBalanceStats>>;
