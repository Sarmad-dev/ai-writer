"use client";

import * as PricingCard from "@/components/landing/pricing/pricing-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Briefcase, Building, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";

export function PricingSection() {
  const plans = [
    {
      icon: <Users />,
      description: "Perfect for individuals",
      name: "Basic",
      price: "Free",
      variant: "outline",
      features: [
        "5 documents per month",
        "Basic AI assistance",
        "Web search integration",
        "Standard templates",
        "Community support",
      ],
    },
    {
      icon: <Briefcase />,
      description: "Ideal for small teams",
      name: "Pro",
      badge: "Popular",
      price: "$29",
      original: "$39",
      period: "/month",
      variant: "default",
      features: [
        "Unlimited documents",
        "Advanced AI models",
        "Priority web search",
        "Custom templates",
        "Graph generation",
        "Priority support",
        "Export options",
      ],
    },
    {
      icon: <Building />,
      name: "Enterprise",
      description: "Perfect for large scale companies",
      price: "$99",
      original: "$129",
      period: "/month",
      variant: "outline",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "API access",
        "SSO integration",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
      ],
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade at any
            time.
          </p>
        </motion.div>
        <div className="mx-auto grid w-full max-w-4xl gap-4 p-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard.Card
              className={cn("w-full max-w-full", index === 1 && "md:scale-105")}
              key={plan.name}
            >
              <PricingCard.Header>
                <PricingCard.Plan>
                  <PricingCard.PlanName>
                    {plan.icon}
                    <span className="text-muted-foreground">{plan.name}</span>
                  </PricingCard.PlanName>
                  {plan.badge && (
                    <PricingCard.Badge>{plan.badge}</PricingCard.Badge>
                  )}
                </PricingCard.Plan>
                <PricingCard.Price>
                  <PricingCard.MainPrice>{plan.price}</PricingCard.MainPrice>
                  <PricingCard.Period>{plan.period}</PricingCard.Period>
                  {plan.original && (
                    <PricingCard.OriginalPrice className="ml-auto">
                      {plan.original}
                    </PricingCard.OriginalPrice>
                  )}
                </PricingCard.Price>
                <Button
                  className={cn("w-full font-semibold")}
                  variant={plan.variant as "outline" | "default"}
                >
                  Get Started
                </Button>
              </PricingCard.Header>

              <PricingCard.Body>
                <PricingCard.Description>
                  {plan.description}
                </PricingCard.Description>
                <PricingCard.List>
                  {plan.features.map((item) => (
                    <PricingCard.ListItem className="text-xs" key={item}>
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 text-foreground"
                      />
                      <span>{item}</span>
                    </PricingCard.ListItem>
                  ))}
                </PricingCard.List>
              </PricingCard.Body>
            </PricingCard.Card>
          ))}
        </div>
      </div>
    </section>
  );
}
