import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, CreditCard, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { CreditPackages } from "./credit-packages";

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [studentProfile, transactions] = await Promise.all([
    db.studentMarketProfile.findUnique({
      where: { userId: session.user.id },
    }),
    db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const creditsBalance = studentProfile?.creditsBalance ?? 0;

  // Calculate total spent and total purchased
  const totalPurchased = transactions
    .filter((t) => t.type === "credit_purchase" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.type === "lesson_payment" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="mt-1 text-gray-500">Manage your credits and view transactions.</p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm font-medium text-indigo-100">Current Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(creditsBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Purchased</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalPurchased)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buy Credits */}
      <CreditPackages />

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((transaction) => {
                const isCredit =
                  transaction.type === "credit_purchase" ||
                  transaction.type === "refund";
                const statusVariant =
                  transaction.status === "completed"
                    ? ("success" as const)
                    : transaction.status === "pending"
                      ? ("warning" as const)
                      : transaction.status === "failed"
                        ? ("error" as const)
                        : ("outline" as const);

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          isCredit
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description ||
                            (transaction.type === "credit_purchase"
                              ? "Credit Purchase"
                              : transaction.type === "lesson_payment"
                                ? "Lesson Payment"
                                : transaction.type === "refund"
                                  ? "Refund"
                                  : transaction.type)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant}>
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Badge>
                      <span
                        className={`text-sm font-semibold ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
