import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const invoices = [
  {
    invoice: "INV001",
    vendor: "MediSupply Corp",
    status: "Validated",
    amount: "$250.00",
    savings: "$25.00",
    date: "2023-11-20",
  },
  {
    invoice: "INV002",
    vendor: "Global Health Services",
    status: "Flagged",
    amount: "$1,200.00",
    savings: "$150.00",
    date: "2023-11-19",
  },
  {
    invoice: "INV003",
    vendor: "TechMed Solutions",
    status: "Pending",
    amount: "$450.00",
    savings: "$0.00",
    date: "2023-11-18",
  },
  {
    invoice: "INV004",
    vendor: "CareFirst Systems",
    status: "Validated",
    amount: "$3,400.00",
    savings: "$340.00",
    date: "2023-11-17",
  },
  {
    invoice: "INV005",
    vendor: "Unity Medical",
    status: "Flagged",
    amount: "$890.00",
    savings: "$89.00",
    date: "2023-11-16",
  },
]

export function RecentInvoices() {
  return (
    <Card className="col-span-3 border shadow-sm">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest invoices processed by the system.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/invoices">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground">Invoice</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Vendor</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-xs font-medium text-muted-foreground">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice} className="hover:bg-muted/50">
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell className="text-muted-foreground">{invoice.vendor}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "Validated"
                        ? "default"
                        : invoice.status === "Flagged"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      invoice.status === "Validated"
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                        : invoice.status === "Flagged"
                          ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
