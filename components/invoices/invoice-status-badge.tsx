"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface InvoiceStatusBadgeProps {
  status: string;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const getStatusVariant = (currentStatus: string) => {
    switch (currentStatus) {
      case "Approved":
      case "Paid":
        return "default"; // Green for approved/paid
      case "Rejected":
      case "Flagged":
        return "destructive"; // Red for rejected/flagged
      case "Pending":
      case "Draft":
        return "secondary"; // Grey for pending/draft
      default:
        return "outline"; // Default for any other status
    }
  };

  const getStatusColorClass = (currentStatus: string) => {
    switch (currentStatus) {
      case "Approved":
      case "Paid":
        return "bg-green-600 hover:bg-green-700";
      case "Rejected":
      case "Flagged":
        return "bg-destructive text-destructive-foreground";
      case "Pending":
      case "Draft":
        return "bg-secondary text-secondary-foreground";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant={getStatusVariant(status)}
      className={cn(getStatusColorClass(status), className)}
    >
      {status}
    </Badge>
  );
}
