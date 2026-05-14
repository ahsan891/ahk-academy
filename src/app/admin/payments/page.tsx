"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Plus, Search } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
  method: string | null;
  description: string | null;
  dueDate: string | null;
  createdAt: string;
  student: { id: string; name: string; email: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    paidAmount: "",
    dueDate: "",
    method: "",
    description: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  async function fetchPayments() {
    const res = await fetch("/api/payments");
    setPayments(await res.json());
    setLoading(false);
  }

  async function fetchStudents() {
    const res = await fetch("/api/students");
    setStudents(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount || "0"),
      }),
    });
    setFormData({ studentId: "", amount: "", paidAmount: "", dueDate: "", method: "", description: "" });
    setShowForm(false);
    fetchPayments();
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
  const paidCount = payments.filter((p) => p.status === "PAID").length;
  const unpaidCount = payments.filter((p) => p.status === "UNPAID" || p.status === "PARTIAL").length;

  const filtered = payments.filter(
    (p) =>
      p.student.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Track all student payments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign size={24} />} />
        <StatsCard title="Total Due" value={formatCurrency(totalDue)} icon={<AlertCircle size={24} />} />
        <StatsCard title="Paid" value={paidCount} icon={<CheckCircle size={24} />} />
        <StatsCard title="Pending" value={unpaidCount} icon={<CreditCard size={24} />} />
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Total Amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <Input
                placeholder="Amount Paid"
                type="number"
                step="0.01"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
              />
              <Input
                placeholder="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <Input
                placeholder="Payment Method (cash, bank, etc.)"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Save Payment</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Payment List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{payment.student.name}</p>
                  <p className="text-sm text-gray-500">{payment.description || "Payment"}</p>
                  {payment.dueDate && (
                    <p className="text-xs text-gray-400">Due: {formatDate(payment.dueDate)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(payment.paidAmount)}{" "}
                    <span className="text-sm text-gray-400">/ {formatCurrency(payment.amount)}</span>
                  </p>
                  <Badge
                    variant={
                      payment.status === "PAID" ? "success" : payment.status === "PARTIAL" ? "warning" : "danger"
                    }
                  >
                    {payment.status}
                  </Badge>
                  {payment.method && <p className="text-xs text-gray-400 mt-1">{payment.method}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
