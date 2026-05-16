"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Clock,
  Users,
} from "lucide-react";

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
  student: { id: string; name: string; email: string; referenceCode: string | null };
  paymentPlan: { id: string; planType: string; amount: number } | null;
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
  createdAt: string;
  student: { id: string; name: string; email: string; referenceCode: string | null };
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed">("all");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const [planForm, setPlanForm] = useState({
    studentId: "",
    planType: "MONTHLY",
    amount: "",
    currency: "USD",
    billingCycleDay: "",
    notes: "",
  });

  const [transactionForm, setTransactionForm] = useState({
    studentId: "",
    amount: "",
    method: "IBAN",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [txRes, planRes, studRes] = await Promise.all([
      fetch("/api/payments/transactions"),
      fetch("/api/payments/plans"),
      fetch("/api/students"),
    ]);
    setTransactions(await txRes.json());
    setPlans(await planRes.json());
    setStudents(await studRes.json());
    setLoading(false);
  }

  async function handleConfirm(transactionId: string) {
    setConfirming(transactionId);
    await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    });
    setConfirming(null);
    fetchData();
  }

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/payments/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...planForm,
        amount: parseFloat(planForm.amount),
        billingCycleDay: planForm.billingCycleDay ? parseInt(planForm.billingCycleDay) : null,
      }),
    });
    setPlanForm({ studentId: "", planType: "MONTHLY", amount: "", currency: "USD", billingCycleDay: "", notes: "" });
    setShowPlanForm(false);
    fetchData();
  }

  async function handleCreateTransaction(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/payments/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
      }),
    });
    setTransactionForm({ studentId: "", amount: "", method: "IBAN", description: "" });
    setShowTransactionForm(false);
    fetchData();
  }

  // Stats calculations
  const totalRevenue = transactions
    .filter((t) => t.status === "CONFIRMED")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = transactions.filter((t) => t.status === "PENDING").length;
  const thisMonthRevenue = transactions
    .filter((t) => {
      if (t.status !== "CONFIRMED") return false;
      const txDate = new Date(t.confirmedAt || t.createdAt);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
  const activePlans = plans.filter((p) => p.isActive).length;

  // Filtering
  const filteredTransactions = transactions
    .filter((t) => {
      if (activeTab === "pending") return t.status === "PENDING";
      if (activeTab === "confirmed") return t.status === "CONFIRMED";
      return true;
    })
    .filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.student.name.toLowerCase().includes(q) ||
        t.referenceCode.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    });

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

  if (loading) return <p className="text-gray-500">Loading payments...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments V2</h1>
          <p className="text-gray-500">Manage payment plans, transactions, and confirmations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPlanForm(!showPlanForm)}>
            <Plus size={18} className="mr-2" />
            New Plan
          </Button>
          <Button onClick={() => setShowTransactionForm(!showTransactionForm)}>
            <Plus size={18} className="mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign size={24} />} />
        <StatsCard title="Pending Payments" value={pendingPayments} icon={<Clock size={24} />} />
        <StatsCard title="This Month" value={formatCurrency(thisMonthRevenue)} icon={<CheckCircle size={24} />} />
        <StatsCard title="Active Plans" value={activePlans} icon={<Users size={24} />} />
      </div>

      {/* Create Plan Form */}
      {showPlanForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Payment Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="grid gap-4 sm:grid-cols-2">
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={planForm.studentId}
                onChange={(e) => setPlanForm({ ...planForm, studentId: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={planForm.planType}
                onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value })}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="PER_SESSION">Per Session</option>
                <option value="PACKAGE">Package (Credits)</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
              <Input
                placeholder="Amount"
                type="number"
                step="0.01"
                value={planForm.amount}
                onChange={(e) => setPlanForm({ ...planForm, amount: e.target.value })}
                required
              />
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={planForm.currency}
                onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="TRY">TRY</option>
                <option value="GBP">GBP</option>
              </select>
              <Input
                placeholder="Billing Cycle Day (1-28)"
                type="number"
                min="1"
                max="28"
                value={planForm.billingCycleDay}
                onChange={(e) => setPlanForm({ ...planForm, billingCycleDay: e.target.value })}
              />
              <Input
                placeholder="Notes"
                value={planForm.notes}
                onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Create Plan</Button>
                <Button type="button" variant="outline" onClick={() => setShowPlanForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Create Transaction Form */}
      {showTransactionForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record Payment Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTransaction} className="grid gap-4 sm:grid-cols-2">
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={transactionForm.studentId}
                onChange={(e) => setTransactionForm({ ...transactionForm, studentId: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Input
                placeholder="Amount"
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                required
              />
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={transactionForm.method}
                onChange={(e) => setTransactionForm({ ...transactionForm, method: e.target.value })}
              >
                <option value="IBAN">IBAN Transfer</option>
                <option value="PAPARA">Papara</option>
                <option value="STRIPE">Stripe</option>
                <option value="CASH">Cash</option>
              </select>
              <Input
                placeholder="Description (optional)"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Record Payment</Button>
                <Button type="button" variant="outline" onClick={() => setShowTransactionForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        {(["all", "pending", "confirmed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "pending" && pendingPayments > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {pendingPayments}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by student name, reference code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transactions Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium">{tx.student.name}</p>
                        <p className="text-xs text-gray-400">{tx.student.email}</p>
                      </td>
                      <td className="py-3 font-medium">{formatCurrency(tx.amount, tx.currency)}</td>
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
                      <td className="py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                      <td className="py-3">
                        {tx.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(tx.id)}
                            disabled={confirming === tx.id}
                          >
                            {confirming === tx.id ? "..." : "Confirm"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Plans Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={20} />
            Payment Plans ({plans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payment plans created yet</p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{plan.student.name}</p>
                    <p className="text-sm text-gray-500">
                      {plan.planType} - {formatCurrency(plan.amount, plan.currency)}
                    </p>
                    {plan.notes && (
                      <p className="text-xs text-gray-400 mt-1">{plan.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {plan.nextDueDate && (
                      <p className="text-sm text-gray-500">
                        Next due: {formatDate(plan.nextDueDate)}
                      </p>
                    )}
                    {plan.creditsRemaining !== null && (
                      <p className="text-sm text-blue-600">
                        Credits: {plan.creditsRemaining}
                      </p>
                    )}
                    <Badge variant={plan.isActive ? "success" : "danger"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
