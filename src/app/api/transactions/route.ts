import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFormatterForCurrency } from "@/lib/currency-utils";
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
    throw new Error("Select a period range");
  }

  const transactions = await getTransactionHistory(
    user.id,
    dateToUTCDate(new Date(from)),
    dateToUTCDate(new Date(to)),
  );

  return Response.json(transactions);
}

async function getTransactionHistory(userId: string, from: Date, to: Date) {
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });

  if (!userSettings) {
    throw new Error("user settings not found");
  }

  const formatter = getFormatterForCurrency(userSettings.currency);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    // use the user's currency to format the amount
    formattedAmount: formatter.format(transaction.amount),
  }));
}

export type GetTransactionHistoryType = Awaited<
  ReturnType<typeof getTransactionHistory>
>;
