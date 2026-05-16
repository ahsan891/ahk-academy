"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PaymentPlan {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  nextDueDate: string | null;
  isActive: boolean;
  student: { id: string; name: string; email: string; referenceCode: string | null };
  transactions: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

interface StudentPaymentStatus {
  studentId: string;
  studentName: string;
  email: string;
  planType: string;
  amount: number;
  currency: string;
  status: "paid" | "overdue" | "upcoming" | "no_plan";
  nextDueDate: string | null;
  lastPaymentDate: string | null;
}

export default function TeacherPaymentsPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/payments/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      });
  }, [session?.user?.id]);

  // Derive student payment statuses
  const studentStatuses: StudentPaymentStatus[] = plans.map((plan) => {
    const lastConfirmedTx = plan.transactions.find((t) => t.status === "CONFIRMED");
    const hasNextDue = plan.nextDueDate ? new Date(plan.nextDueDate) : null;
    const isOverdue = hasNextDue && hasNextDue < new Date();
    const recentPayment = lastConfirmedTx
      ? new Date(lastConfirmedTx.createdAt)
      : null;

    let status: "paid" | "overdue" | "upcoming" | "no_plan" = "upcoming";
    if (isOverdue) {
      status = "overdue";
    } else if (recentPayment) {
      // Consider "paid" if last payment was within the billing period
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      status = recentPayment > thirtyDaysAgo ? "paid" : "upcoming";
    }

    return {
      studentId: plan.student.id,
      studentName: plan.student.name,
      email: plan.student.email,
      planType: plan.planType,
      amount: plan.amount,
      currency: plan.currency,
      status,
      nextDueDate: plan.nextDueDate,
      lastPaymentDate: lastConfirmedTx?.createdAt || null,
    };
  });

  // Stats
  const totalStudents = plans.length;
  const totalRevenue = plans.reduce((sum, p) => {
    const confirmed = p.transactions
      .filter((t) => t.status === "CONFIRMED")
      .reduce((s, t) => s + t.amount, 0);
    return sum + confirmed;
  }, 0);
  const overdueCount = studentStatuses.filter((s) => s.status === "overdue").length;
  const paidCount = studentStatuses.filter((s) => s.status === "paid").length;

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

  if (loading) return <p className="text-gray-500">Loading payment data...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Payments</h1>
        <p className="text-gray-500">Overview of your students&apos; payment status</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Total Students" value={totalStudents} icon={<Users size={24} />} />
        <StatsCard
          title="Revenue (Your Students)"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={24} />}
        />
        <StatsCard title="Paid This Month" value={paidCount} icon={<CheckCircle size={24} />} />
        <StatsCard title="Overdue" value={overdueCount} icon={<AlertCircle size={24} />} />
      </div>

      {/* Student Payment Status List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          {studentStatuses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No students with payment plans assigned to you yet.
            </p>
          ) : (
            <div className="space-y-3">
              {studentStatuses.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{student.studentName}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {student.planType} - {formatCurrency(student.amount, student.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        student.status === "paid"
                          ? "success"
                          : student.status === "overdue"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {student.status === "paid"
                        ? "Paid"
                        : student.status === "overdue"
                        ? "Overdue"
                        : "Upcoming"}
                    </Badge>
                    {student.nextDueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {formatDate(student.nextDueDate)}
                      </p>
                    )}
                    {student.lastPaymentDate && (
                      <p className="text-xs text-gray-400">
                        Last paid: {formatDate(student.lastPaymentDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      {plans.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue Breakdown by Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plans.map((plan) => {
                const studentRevenue = plan.transactions
                  .filter((t) => t.status === "CONFIRMED")
                  .reduce((sum, t) => sum + t.amount, 0);
                const txCount = plan.transactions.filter(
                  (t) => t.status === "CONFIRMED"
                ).length;

                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{plan.student.name}</p>
                      <p className="text-xs text-gray-400">
                        {txCount} confirmed payment{txCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="font-medium text-green-600">
                      {formatCurrency(studentRevenue, plan.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
