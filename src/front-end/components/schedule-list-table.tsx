import { useEffect } from "react"
import { useGetSchedule } from "@/hooks/useGetSchedule"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { toast } from "./ui/use-toast"
import { millisecondsToTimeFrame } from "@/utils/timeUtils"
import { formatDistanceToNow } from "date-fns"
import { TruncatedAmount } from "./ui/truncated-amount"

export function ScheduleListTable({ onSelectSchedule }: { onSelectSchedule: (schedule: any) => void }) {
  const { schedules, isError, isLoading } = useGetSchedule()

  useEffect(() => {
    if (isError) {
      toast({
        title: "Failed to fetch schedules",
        description: "Please try again",
        variant: "destructive",
        action: <Button variant="outline" onClick={() => window.location.reload()} className="text-black">Retry</Button>
      })
    }
  }, [isError])

  return (
    <Card className="flex flex-col">
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
          <div className="overflow-auto max-h-[calc(100vh-20rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background">Name</TableHead>
                  <TableHead className="sticky top-0 bg-background">Amount (USDC)</TableHead>
                  <TableHead className="sticky top-0 bg-background">Interval</TableHead>
                  <TableHead className="sticky top-0 bg-background">Last Executed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow
                    className="cursor-pointer h-8"
                    key={schedule.id}
                    onClick={() => onSelectSchedule(schedule)}
                  >
                    <TableCell className="py-4">{schedule.name}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center">
                        <img
                          src="/usd-coin-usdc-logo.svg"
                          alt="USDC Logo"
                          className="w-5 h-5 mr-2"
                        />
                        <TruncatedAmount amount={(Number(schedule.amount) / 1e6).toFixed(2)}/>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{millisecondsToTimeFrame(Number(schedule.interval))}</TableCell>
                    <TableCell className="py-4">
                      {(() => {
                        const lastExecuted = new Date(Number(schedule.lastExecuted) * 1000);
                        return formatDistanceToNow(lastExecuted, { addSuffix: true });
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No DCA schedules found. Create a new schedule to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}