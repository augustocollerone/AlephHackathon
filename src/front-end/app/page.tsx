"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Coins } from "lucide-react"
import TimeFrameSelector, { TimeFrame } from "@/components/ui/timeframe-selector"
import { CustomConnectButton } from "@/components/ui/wallet-connect-button"

interface Schedule {
  id: number;
  amount: string;
  asset: string;
  timeFrame: string;
}

export default function Home() {
  const [amount, setAmount] = useState("")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.DAILY)

  const handleCreateSchedule = () => {
    if (amount && timeFrame) {
      const newSchedule: Schedule = {
        id: Date.now(),
        amount,
        asset: "0x0",
        timeFrame,
      }
      // TODO: Call smart contract to create schedule
      setAmount("")
      setTimeFrame(TimeFrame.DAILY)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-end mb-4">
              <CustomConnectButton />
            </div>
            <CardTitle>Create DCA Schedule</CardTitle>
            <CardDescription>Set up your dollar cost averaging schedule for crypto investments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount-input">Amount and Asset</Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="amount-input"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-frame">Time Frame</Label>
              <TimeFrameSelector value={timeFrame} onChange={setTimeFrame} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateSchedule} className="w-full">
              Create DCA Schedule
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}