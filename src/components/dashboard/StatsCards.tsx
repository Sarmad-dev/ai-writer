"use client";

import { FileText, Clock, Zap, Target } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  gradient: string;
  index: number;
  isPositive?: boolean;
  changeValue?: string;
}

export function StatsCards() {
  const statsData: StatCardProps[] = [
    {
      title: "Total Content",
      value: "24",
      change: "+12%",
      isPositive: true,
      icon: FileText,
      gradient: "bg-linear-to-r from-blue-500 to-blue-600",
      index: 0,
    },
    {
      title: "Words Generated",
      value: "45.2K",
      change: "+18%",
      isPositive: true,
      icon: Zap,
      gradient: "bg-linear-to-r from-indigo-500 to-purple-600",
      index: 1,
    },
    {
      title: "Time Saved",
      value: "32h",
      change: "+8%",
      isPositive: true,
      icon: Clock,
      gradient: "bg-linear-to-r from-green-500 to-emerald-600",
      index: 2,
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+2%",
      isPositive: true,
      icon: Target,
      gradient: "bg-linear-to-r from-orange-500 to-red-600",
      index: 3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 rounded-xl border bg-card">
      {statsData.map((stat, index) => (
        <div key={stat.title} className="flex items-start">
          <div className="flex-1 space-y-2 sm:space-y-4 lg:space-y-6">
            <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
              <stat.icon className="size-3.5 sm:size-[18px]" />
              <span className="text-[10px] sm:text-xs lg:text-sm font-medium truncate">
                {stat.title}
              </span>
            </div>
            <p className="text-lg sm:text-xl lg:text-[28px] font-semibold leading-tight tracking-tight">
              {stat.value}
            </p>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs lg:text-sm font-medium">
              <span
                className={
                  stat.isPositive ? "text-emerald-600" : "text-red-600"
                }
              >
                {stat.change}
                <span className="hidden sm:inline">{stat.changeValue}</span>
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                vs Last Months
              </span>
            </div>
          </div>
          {index < statsData.length - 1 && (
            <div className="hidden lg:block w-px h-full bg-border mx-4 xl:mx-6" />
          )}
        </div>
      ))}
    </div>
  );
}
