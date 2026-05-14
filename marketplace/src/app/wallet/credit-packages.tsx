"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const PACKAGES = [
  {
    credits: 5,
    price: 49,
    label: "Starter",
    perCredit: 9.8,
    popular: false,
  },
  {
    credits: 20,
    price: 179,
    label: "Regular",
    perCredit: 8.95,
    popular: true,
  },
  {
    credits: 50,
    price: 399,
    label: "Pro",
    perCredit: 7.98,
    popular: false,
  },
  {
    credits: 100,
    price: 699,
    label: "Premium",
    perCredit: 6.99,
    popular: false,
  },
];

export function CreditPackages() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handlePurchase(pkg: (typeof PACKAGES)[number]) {
    setLoading(true);
    setMessage(null);
    setSelectedPackage(pkg.credits);

    try {
      const res = await fetch("/api/wallet/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: pkg.credits,
          amount: pkg.price,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process purchase.");
      }

      const data = await res.json();

      // If the API returns a Stripe checkout URL, redirect
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setMessage({
        type: "success",
        text: `Successfully purchased ${pkg.credits} credits!`,
      });

      // Reload page to show updated balance
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Buy Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className={`relative rounded-xl border-2 p-5 transition-all ${
                pkg.popular
                  ? "border-indigo-600 shadow-md"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">{pkg.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {pkg.credits}
                </p>
                <p className="text-sm text-gray-500">credits</p>
                <p className="mt-3 text-2xl font-bold text-indigo-600">
                  {formatCurrency(pkg.price)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(pkg.perCredit)} per credit
                </p>
                <Button
                  className="mt-4 w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  size="sm"
                  disabled={loading}
                  onClick={() => handlePurchase(pkg)}
                >
                  {loading && selectedPackage === pkg.credits ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {loading && selectedPackage === pkg.credits
                    ? "Processing..."
                    : "Purchase"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg border p-3 ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
