import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}
