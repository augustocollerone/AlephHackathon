"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TimeFrameSelector, { TimeFrame } from "@/components/ui/timeframe-selector"
import { CustomConnectButton } from "@/components/ui/custom-connect-button"
import { useCreateSchedule } from "@/hooks/useCreateSchedule"
import { useAccount, useBalance } from 'wagmi'
import { ReloadIcon } from "@radix-ui/react-icons"
import { toast } from "./use-toast"
import { timeFrameToMilliseconds } from "@/utils/timeUtils"

const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Ethereum Mainnet USDC address

export function CreateDCAScheduleCard() {
  const [amount, setAmount] = useState("")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.DAILY)
  const { createSchedule, isLoading, isSuccess, isError, error } = useCreateSchedule()
  const { address, isConnected } = useAccount()

  const { data: balance } = useBalance({
    address: address,
    token: USDC_ADDRESS,
  })

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Schedule created successfully",
        description: "You can now view your schedule in the list",
      })
    }
  }, [isSuccess])

  const handleCreateSchedule = async () => {
    if (!isConnected) {
      toast({
        title: "Please connect your wallet first",
        description: "You need to connect your wallet to create a schedule",
      })
      return
    }

    if (amount && timeFrame) {
      try {
        const intervalInMilliseconds = timeFrameToMilliseconds(timeFrame)
  
        await createSchedule(
          "Test DCA Schedule",
          Number(amount),
          intervalInMilliseconds,
          100,
        )

        setAmount("")
        setTimeFrame(TimeFrame.DAILY)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to create DCA schedule",
          description: "Please try again",
        })
      }
    } else {
      toast({
        title: "Please fill in all fields",
        description: "You need to fill in the amount and time frame to create a schedule",
      })
    }
  }

  return (
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
          <Label htmlFor="amount-input">Amount</Label>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <img
                src="/usd-coin-usdc-logo.svg"
                alt="USDC Logo"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
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
          {balance && (
            <p className="text-sm text-gray-500">
              Balance: {parseFloat(balance.formatted).toFixed(2)} {balance.symbol}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time-frame">Time Frame</Label>
          <TimeFrameSelector value={timeFrame} onChange={setTimeFrame} />
        </div>
      </CardContent>
      <CardFooter>
        {isLoading ? (
          <Button className="w-full" disabled>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button onClick={handleCreateSchedule} className="w-full" disabled={isLoading || !isConnected}>
            Create DCA Schedule
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}