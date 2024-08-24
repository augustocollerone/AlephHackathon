"use client"

import { useState } from "react"
import { CreateDCAScheduleCard } from "@/components/create-dca-schedule-card"
import { ScheduleListTable } from "@/components/schedule-list-table"
import { ScheduleDetails } from "@/components/schedule-details"

export default function Home() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  return (
    <div className="flex sm:items-start md:items-center justify-center min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 w-full p-4 h-full]">
        <div className="w-full md:w-2/6 h-auto md:h-full">
          <CreateDCAScheduleCard />
        </div>
        <div className="w-full md:w-4/6 h-auto md:h-full">
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