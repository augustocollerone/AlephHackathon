import { useEffect, useState } from "react"
import { useGetSchedule } from "@/hooks/useGetSchedule"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { TruncatedAmount } from "./truncated-amount"
import { Skeleton } from "./skeleton"
import { Button } from "./button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "./use-toast"
import { millisecondsToTimeFrame } from "@/utils/timeUtils"

export function ScheduleListTable() {
  const { schedules, isError, isLoading } = useGetSchedule()
  const [visibleSchedules, setVisibleSchedules] = useState(5)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const toggleExpand = () => {
    if (isExpanded) {
      setVisibleSchedules(5)
      setIsExpanded(false)
    } else {
      setVisibleSchedules(schedules?.length || 0)
      setIsExpanded(true)
    }
  }

  useEffect(() => {
    if (isError) {
      toast({
        title: "Failed to fetch schedules",
        description: "Please try again",
        variant: "destructive",
        action: <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      })
    }
  }, [isError])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>DCA Schedules</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-5" />
            <Skeleton className="w-full h-5" />
          </div>
        ) : schedules && schedules.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Last Executed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.slice(0, visibleSchedules).map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.name}</TableCell>
                    <TableCell><TruncatedAmount amount={schedule.amount.toString()}/></TableCell>
                    <TableCell>{millisecondsToTimeFrame(Number(schedule.interval))}</TableCell>
                    <TableCell>{new Date(Number(schedule.lastExecuted) * 1000).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {schedules.length > 5 && (
              <div className="mt-4 flex">
                <Button onClick={toggleExpand} variant="ghost" className="flex items-center">
                  {isExpanded ? (
                    <>
                      Show Less <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No DCA schedules found. Create a new schedule to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}