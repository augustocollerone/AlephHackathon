"use client"

import { CreateDCAScheduleCard } from "@/components/ui/create-dca-schedule-card"
import { ScheduleListTable } from "@/components/ui/schedule-list-table"

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <div className="w-full md:w-1/2">
          <CreateDCAScheduleCard />
        </div>
        <div className="w-full md:w-1/2">
          <ScheduleListTable />
        </div>
      </div>
    </div>
  )
}