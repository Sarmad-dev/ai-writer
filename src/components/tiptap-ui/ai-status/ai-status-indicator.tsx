"use client";

import React from "react";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export type AIStatus = "idle" | "generating" | "success" | "error";

interface AIStatusIndicatorProps {
  status: AIStatus;
  message?: string;
  className?: string;
}

export function AIStatusIndicator({ status, message, className = "" }: AIStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "generating":
        return {
          icon: Loader2,
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          animation: "animate-spin",
          defaultMessage: "AI is generating..."
        };
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          animation: "",
          defaultMessage: "AI generation complete"
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          animation: "",
          defaultMessage: "AI generation failed"
        };
      default:
        return {
          icon: Sparkles,
          color: "text-gray-500",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          animation: "",
          defaultMessage: "AI ready"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  if (status === "idle") return null;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
        ${config.bgColor} ${config.borderColor} ${config.color}
        ${className}
      `}
    >
      <Icon className={`w-4 h-4 ${config.animation}`} />
      <span className="font-medium">{displayMessage}</span>
    </div>
  );
}