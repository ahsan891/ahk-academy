"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  referenceCode: string;
  description: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

interface PaymentPlan {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  billingCycleDay: number | null;
  nextDueDate: string | null;
  creditsRemaining: number | null;
  isActive: boolean;
  notes: string | null;
}

export default function StudentPaymentsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      fetch("/api/payments/transactions").then((r) => r.json()),
      fetch("/api/payments/plans").then((r) => r.json()),
    ]).then(([txData, planData]) => {
      setTransactions(txData);
      setPlans(planData);
      setLoading(false);
    });
  }, [session?.user?.id]);

  const activePlan = plans.find((p) => p.isActive);
  const totalPaid = transactions
    .filter((t) => t.status === "CONFIRMED")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const confirmedCount = transactions.filter((t) => t.status === "CONFIRMED").length;

  function formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <p className="text-gray-500">Loading payments...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
        <p className="text-gray-500">View your plan, payment history, and payment instructions</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard
          title="Total Paid"
          value={formatCurrency(totalPaid, activePlan?.currency)}
          icon={<DollarSign size={24} />}
        />
        <StatsCard
          title="Confirmed"
          value={confirmedCount}
          icon={<CheckCircle size={24} />}
        />
        <StatsCard
          title="Pending"
          value={pendingCount}
          icon={<Clock size={24} />}
        />
        <StatsCard
          title="Credits Remaining"
          value={activePlan?.creditsRemaining ?? "N/A"}
          icon={<CreditCard size={24} />}
        />
      </div>

      {/* Current Plan */}
      {activePlan && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Plan Type</p>
                <p className="font-medium text-lg">{activePlan.planType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-lg">
                  {formatCurrency(activePlan.amount, activePlan.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Due Date</p>
                <p className="font-medium text-lg">
                  {activePlan.nextDueDate ? formatDate(activePlan.nextDueDate) : "Not set"}
                </p>
              </div>
            </div>
            {activePlan.creditsRemaining !== null && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Credits Remaining</p>
                <div className="h-3 w-full rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${Math.min(
                        ((activePlan.creditsRemaining || 0) / activePlan.amount) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {activePlan.creditsRemaining} credits available
                </p>
              </div>
            )}
            {activePlan.notes && (
              <p className="mt-3 text-sm text-gray-500 italic">{activePlan.notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={20} />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* IBAN */}
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <CreditCard size={16} />
                Bank Transfer (IBAN)
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Bank:</span> Ziraat Bankasi</p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">IBAN:</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    TR33 0001 0009 5432 1678 9050 01
                  </code>
                  <button
                    onClick={() => copyToClipboard("TR330001000954321678905001")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy size={14} />
                  </button>
                </p>
                <p><span className="font-medium">Recipient:</span> AHK Academy</p>
                <p className="text-amber-600 font-medium mt-2">
                  Important: Include your reference code in the transfer description!
                </p>
              </div>
            </div>

            {/* Papara */}
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign size={16} />
                Papara
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Papara Number:</span> 1532847690</p>
                <p className="text-amber-600 font-medium mt-2">
                  Include your reference code in the note field.
                </p>
              </div>
            </div>

            {/* Stripe */}
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <ExternalLink size={16} />
                Credit/Debit Card (Stripe)
              </h3>
              <Button className="mt-2" variant="outline" disabled>
                Pay with Card (Coming Soon)
              </Button>
            </div>

            {copied && (
              <p className="text-sm text-green-600 font-medium">Copied to clipboard!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payment records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-600">{formatDate(tx.createdAt)}</td>
                      <td className="py-3 font-medium">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline">{tx.method}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            tx.status === "CONFIRMED"
                              ? "success"
                              : tx.status === "PENDING"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tx.referenceCode}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
