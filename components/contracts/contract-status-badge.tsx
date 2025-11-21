import { Badge } from "@/components/ui/badge"

type ContractStatus = "Active" | "Pending" | "Expired" | "Draft"

interface ContractStatusBadgeProps {
  status: ContractStatus
}

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  const variants: Record<ContractStatus, { variant: "default" | "secondary" | "destructive"; className?: string }> = {
    Active: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    Pending: { variant: "secondary" },
    Expired: { variant: "destructive" },
    Draft: { variant: "secondary" },
  }

  const config = variants[status]

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  )
}
