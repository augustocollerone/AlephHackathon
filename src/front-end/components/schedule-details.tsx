import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for the chart
const chartData = [
  { date: "2023-01-01", amountOfEthBought: 0.5 },
  { date: "2023-02-01", amountOfEthBought: 0.8 },
  { date: "2023-03-01", amountOfEthBought: 0.6 },
  { date: "2023-04-01", amountOfEthBought: 1.1 },
  { date: "2023-05-01", amountOfEthBought: 0.9 },
  { date: "2023-06-01", amountOfEthBought: 1.2 },
]

const chartConfig = {
  amountOfEthBought: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ScheduleDetailsProps {
  schedule: any;
  onBack: () => void;
}

export function ScheduleDetails({ schedule, onBack }: ScheduleDetailsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-start items-center gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <CardTitle>Schedule Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
      <Card>
      <CardHeader>
        <CardTitle>Amount of ETH Bought</CardTitle>
        <CardDescription>January - June 2023</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleString('default', { month: 'short' })}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="amountOfEthBought"
              type="natural"
              stroke="var(--color-amountOfEthBought)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              ETH Bought trending up by 140% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing Amount of ETH Bought for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>

      </CardContent>
    </Card>
  );
}