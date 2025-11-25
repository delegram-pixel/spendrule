"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, FileCheck2, AlertTriangle, ChartBar, Settings, ShieldCheck, LogOut, FileText, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    name: "Validation",
    href: "/dashboard/validation",
    icon: FileCheck2,
  },
  {
    name: "Contracts",
    href: "/dashboard/contracts",
    icon: FileText,
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileCheck2,
  },
  {
    name: "Ingestion",
    href: "/dashboard/ingestion",
    icon: Upload,
  },
  {
    name: "Exceptions",
    href: "/dashboard/exceptions",
    icon: AlertTriangle,
  },
  {
    name: "Approvals",
    href: "/dashboard/approvals",
    icon: ShieldCheck,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartBar,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-card md:block w-64 shrink-0 h-screen sticky top-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-20 items-center gap-3 border-b px-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">Marvin McKinney</p>
                <p className="text-xs text-muted-foreground">Senior manager</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-3 text-sm font-medium gap-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 transition-all",
                  pathname === item.href
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  )
}
