"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
  method: string | null;
  description: string | null;
  dueDate: string | null;
  createdAt: string;
}

export default function StudentPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/student/payments`)
      .then((r) => r.json())
      .then((d) => { setPayments(d); setLoading(false); });
  }, [session?.user?.id]);

  const totalPaid = payments.reduce((s, p) => s + p.paidAmount, 0);
  const totalDue = payments.reduce((s, p) => s + (p.amount - p.paidAmount), 0);
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const paidCount = payments.filter((p) => p.status === "PAID").length;

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
        <p className="text-gray-500">View your payment history and balance</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Total Course Fee" value={formatCurrency(totalAmount)} icon={<DollarSign size={24} />} />
        <StatsCard title="Total Paid" value={formatCurrency(totalPaid)} icon={<CheckCircle size={24} />} />
        <StatsCard title="Remaining" value={formatCurrency(totalDue)} icon={<AlertCircle size={24} />} />
        <StatsCard title="Completed Payments" value={paidCount} icon={<CreditCard size={24} />} />
      </div>

      {/* Progress Bar */}
      {totalAmount > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Payment Progress</p>
              <p className="text-sm text-gray-500">{Math.round((totalPaid / totalAmount) * 100)}%</p>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {payments.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No payment records</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{p.description || "Payment"}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                    {p.dueDate && <p className="text-xs text-gray-400">Due: {formatDate(p.dueDate)}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(p.paidAmount)} <span className="text-sm text-gray-400">/ {formatCurrency(p.amount)}</span>
                    </p>
                    <Badge variant={p.status === "PAID" ? "success" : p.status === "PARTIAL" ? "warning" : "danger"}>
                      {p.status}
                    </Badge>
                    {p.method && <p className="text-xs text-gray-400 mt-1">{p.method}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
