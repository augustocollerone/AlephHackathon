"use client"

import { useState } from "react"
import { CreateDCAScheduleCard } from "@/components/create-dca-schedule-card"
import { ScheduleListTable } from "@/components/schedule-list-table"
import { ScheduleDetails } from "@/components/schedule-details"

export default function Home() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  return (
    <div className="flex sm:items-start md:items-start justify-center min-h-screen pt-4 md:pt-16">
      <div className="flex flex-col md:flex-row gap-8 w-full p-4 md:h-[calc(100vh-4rem)]">
        <div className="w-full md:w-2/6 md:h-full md:overflow-y-auto">
          <CreateDCAScheduleCard />
        </div>
        <div className="w-full md:w-4/6 md:h-full md:overflow-y-auto">
          {selectedSchedule ? (
            <ScheduleDetails
              schedule={selectedSchedule}
              onBack={() => setSelectedSchedule(null)}
            />
          ) : (
            <ScheduleListTable onSelectSchedule={setSelectedSchedule} />
          )}
        </div>
      </div>
    </div>
  )
}