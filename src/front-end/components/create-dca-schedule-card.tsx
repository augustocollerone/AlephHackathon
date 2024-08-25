"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TimeFrameSelector, { TimeFrame } from "@/components/ui/timeframe-selector"

import { useCreateSchedule } from "@/hooks/useCreateSchedule"
import { useAccount, useBalance } from 'wagmi'
import { ReloadIcon } from "@radix-ui/react-icons"
import { toast } from "./ui/use-toast"
import { timeFrameToMilliseconds } from "@/utils/timeUtils"
import { CustomConnectButton } from "./custom-connect-button"
import { Slider } from "./ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { USDC_ADDRESS, ASSETS } from "@/contracts/swapContracts"

export function CreateDCAScheduleCard() {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [maxCount, setMaxCount] = useState("")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.DAILY)
  const [assetPercentages, setAssetPercentages] = useState(
    Object.fromEntries(ASSETS.map(asset => [asset.name, asset.name === "WETH" ? 100 : 0]))
  )
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
          name,
          Number(amount),
          intervalInMilliseconds,
          Number(maxCount),
          ASSETS.map(asset => ({ token: asset.address as `0x${string}`, percentage: assetPercentages[asset.name] })),
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

  const handlePercentageChange = (assetName: string, newValue: number) => {
    const oldValue = assetPercentages[assetName]
    const diff = newValue - oldValue

    const newPercentages = { ...assetPercentages, [assetName]: newValue }

    const otherAssets = Object.keys(assetPercentages).filter(name => name !== assetName)
    const totalOtherPercentages = otherAssets.reduce((sum, name) => sum + newPercentages[name], 0)

    if (totalOtherPercentages > 0) {
      otherAssets.forEach(name => {
        const ratio = newPercentages[name] / totalOtherPercentages
        newPercentages[name] = Math.max(0, newPercentages[name] - diff * ratio)
      })
    }

    // Ensure the total is always 100%
    const total = Object.values(newPercentages).reduce((sum, value) => sum + value, 0)
    if (total !== 100) {
      const adjustment = 100 - total
      newPercentages[assetName] += adjustment
    }

    setAssetPercentages(newPercentages)
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex justify-end mb-4">
          <CustomConnectButton />
        </div>
        <CardTitle>Create DCA Schedule</CardTitle>
        <CardDescription>Set up your dollar cost averaging schedule for crypto investments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name-input">Name</Label>
          <Input
            id="name-input"
            placeholder="Enter name for your schedule"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <Label htmlFor="weth-slider">WETH</Label>
          <Slider
            id="weth-slider"
            value={[assetPercentages.WETH]}
            onValueChange={([value]) => handlePercentageChange("WETH", value)}
            max={100}
            min={0}
            step={1}
          />
          <p className="text-sm text-gray-500">{assetPercentages.WETH.toFixed(2)}%</p>
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Advanced</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {ASSETS.slice(1).map(asset => (
                  <div key={asset.name} className="space-y-2">
                    <Label htmlFor={`${asset.name.toLowerCase()}-slider`}>{asset.name}</Label>
                    <Slider
                      id={`${asset.name.toLowerCase()}-slider`}
                      value={[assetPercentages[asset.name]]}
                      onValueChange={([value]) => handlePercentageChange(asset.name, value)}
                      max={100}
                      min={0}
                      step={1}
                    />
                    <p className="text-sm text-gray-500">{assetPercentages[asset.name].toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-2">
          <Label htmlFor="time-frame">Time Frame</Label>
          <TimeFrameSelector value={timeFrame} onChange={setTimeFrame} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-count">Max Count</Label>
          <Input
            id="max-count"
            placeholder="Enter max count"
            value={maxCount}
            onChange={(e) => setMaxCount(e.target.value)}
            type="number"
            min="1"
            step="1"
          />
        </div>
      </CardContent>
      <CardFooter>
        {isLoading ? (
          <Button className="w-full" disabled>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button onClick={handleCreateSchedule} className="w-full h-10" disabled={isLoading || !isConnected}>
            Create DCA Schedule
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}