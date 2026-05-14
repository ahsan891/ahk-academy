import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Pricing - AHK Marketplace" };

const packages = [
  {
    name: "Starter",
    credits: 5,
    price: 49,
    pricePerCredit: 9.8,
    popular: false,
    features: [
      "5 lesson credits",
      "Access to all tutors",
      "Flexible scheduling",
      "Lesson notes & feedback",
      "Credits valid for 30 days",
    ],
  },
  {
    name: "Popular",
    credits: 20,
    price: 179,
    pricePerCredit: 8.95,
    popular: true,
    features: [
      "20 lesson credits",
      "Access to all tutors",
      "Flexible scheduling",
      "Lesson notes & feedback",
      "Priority booking",
      "Credits valid for 90 days",
    ],
  },
  {
    name: "Pro",
    credits: 50,
    price: 399,
    pricePerCredit: 7.98,
    popular: false,
    features: [
      "50 lesson credits",
      "Access to all tutors",
      "Flexible scheduling",
      "Lesson notes & feedback",
      "Priority booking",
      "Instant lesson access",
      "Credits valid for 180 days",
    ],
  },
  {
    name: "Enterprise",
    credits: 100,
    price: 699,
    pricePerCredit: 6.99,
    popular: false,
    features: [
      "100 lesson credits",
      "Access to all tutors",
      "Flexible scheduling",
      "Lesson notes & feedback",
      "Priority booking",
      "Instant lesson access",
      "Dedicated support",
      "Credits never expire",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Purchase credits to book lessons with any tutor. The more credits
            you buy, the more you save.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`relative flex flex-col ${
                pkg.popular
                  ? "border-2 border-indigo-600 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-indigo-600 px-3 py-1 text-white">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${pkg.price}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {pkg.credits} credits &middot; ${pkg.pricePerCredit.toFixed(2)}{" "}
                  per credit
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-6 block">
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ-like section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 text-left sm:grid-cols-2">
            {[
              {
                q: "What is a credit?",
                a: "One credit equals one 30-minute lesson with any tutor on the platform. Some tutors may charge more than one credit per session based on their expertise.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes, unused credits can be refunded within 14 days of purchase. Partially used packages are refunded for the remaining credits.",
              },
              {
                q: "Do credits expire?",
                a: "Each package has a different validity period. Enterprise credits never expire, while other packages range from 30 to 180 days.",
              },
              {
                q: "How do I book a lesson?",
                a: "Browse our tutors, select one you like, choose an available time slot, and confirm your booking. One credit is deducted per 30-minute lesson.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border bg-white p-5">
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
