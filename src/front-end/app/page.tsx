"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Coins, Loader2 } from "lucide-react"
import TimeFrameSelector, { TimeFrame } from "@/components/ui/timeframe-selector"
import { CustomConnectButton } from "@/components/ui/wallet-connect-button"
import { useCreateSchedule } from "@/hooks/useCreateSchedule"
import { useAccount } from 'wagmi'
import { ReloadIcon } from "@radix-ui/react-icons"

export default function Home() {
  const [amount, setAmount] = useState("")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.DAILY)
  const [isLoading, setIsLoading] = useState(false)
  const { createSchedule } = useCreateSchedule()
  const { isConnected } = useAccount()

  const handleCreateSchedule = async () => {
    if (!isConnected) {
      console.log("Please connect your wallet first")
      return
    }

    if (amount && timeFrame) {
      setIsLoading(true)
      try {
        console.log("Attempting to create schedule...")
        const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18)) // Convert to Wei
        const intervalInMilliseconds = timeFrameToMilliseconds(timeFrame)
        console.log("Amount in Wei:", amountInWei.toString())
        console.log("Interval in milliseconds:", intervalInMilliseconds)
        
        await createSchedule(
          "Test DCA Schedule", // name
          amountInWei, // amount
          intervalInMilliseconds, // interval
          100, // maxCount (arbitrary value, adjust as needed)
          '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // feeToken (using the address from the hook)
        )
        console.log("Schedule creation initiated")

        setAmount("")
        setTimeFrame(TimeFrame.DAILY)
      } catch (error) {
        console.error("Failed to create DCA schedule:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      console.log("Please fill in all fields")
    }
  }

  const timeFrameToMilliseconds = (tf: TimeFrame): number => {
    switch (tf) {
      case TimeFrame.DAILY: return 86400000 // 24 * 60 * 60 * 1000
      case TimeFrame.WEEKLY: return 604800000 // 7 * 24 * 60 * 60 * 1000
      case TimeFrame.MONTHLY: return 2592000000 // 30 * 24 * 60 * 60 * 1000
      default: return 86400000 // Default to daily
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

            {isLoading ? (
              <>
                <Button className="w-full" disabled>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              </>
            ) : (
              <Button onClick={handleCreateSchedule} className="w-full" disabled={isLoading}>
                Create DCA Schedule
              </Button>
            )}
            
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}