import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { Label as RechartsLabel, LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from './ui/progress';
import { ASSETS } from '@/contracts/swapContracts';
import { Label } from './ui/label';

// Mock data for the chart
const chartData = [
  { date: "2023-01-01", amountOfEthBought: 0.5 },
  { date: "2023-02-01", amountOfEthBought: 0.8 },
  { date: "2023-03-01", amountOfEthBought: 0.6 },
  { date: "2023-04-01", amountOfEthBought: 1.1 },
  { date: "2023-05-01", amountOfEthBought: 0.9 },
  { date: "2023-06-01", amountOfEthBought: 1.2 },
]

const chartConfigRadar = {
  percentage: {
    label: "Percentage",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const chartConfig = {
  amountOfEthBought: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ScheduleDetailsProp {
  id: bigint;
  name: string;
  amount: bigint;
  interval: bigint;
  count: bigint;
  maxCount: bigint;
  gelatoTaskId: `0x${string}`;
  outputSwaps: readonly {
    token: `0x${string}`;
    percentage: number;
  }[];
  created: bigint;
  lastExecuted: bigint;
  active: boolean;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export function ScheduleDetails({ schedule, onBack }: { schedule: ScheduleDetailsProp, onBack: () => void }) {
  const chartDataPie = schedule.outputSwaps.map(swap => {
    const asset = ASSETS.find(asset => asset.address.toLowerCase() === swap.token.toLowerCase());
    return {
      name: asset ? asset.name : 'Unknown',
      value: swap.percentage,
    };
  });

  return (
    <Card className="h-full flex flex-col gap-4">
      <CardHeader className='gap-2'>
        <div className="flex justify-start items-center gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <CardTitle>Schedule Details</CardTitle>
        </div>
        <div className="space-y-2">
          <Progress value={(Number(schedule.count) / Number(schedule.maxCount)) * 100} />
          <Label>
            {schedule.count.toString()} of {schedule.maxCount.toString()} swaps done - Next on {new Date(Number(schedule.lastExecuted) * 1000 + Number(schedule.interval)).toLocaleDateString()}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 overflow-y-auto">

        <div>
          <h3 className="text-lg font-semibold mb-2">Token Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Current allocation</p>
          <ChartContainer
            config={chartConfigRadar}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartDataPie}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartDataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Pie
                  data={chartDataPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}  // Increased inner radius
                  outerRadius={100} // Added outer radius
                  strokeWidth={5}
                >
                  {chartDataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsLabel
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const totalAmount = Number(schedule.amount) / 1e6; // Assuming amount is in USDC (6 decimals)
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 10}
                            className="fill-foreground text-2xl font-bold"
                          >
                            ${totalAmount.toFixed(2)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 15}
                            className="fill-muted-foreground text-sm"
                          >
                            USDC
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              Distribution as per schedule
            </p>
            <p className="text-muted-foreground">
              Created on {new Date(Number(schedule.created) * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Amount of ETH Bought</h3>
          <p className="text-sm text-muted-foreground mb-4">January - June 2023</p>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
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
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              ETH Bought trending up by 140% <TrendingUp className="h-4 w-4" />
            </p>
            <p className="text-muted-foreground">
              Showing Amount of ETH Bought for the last 6 months
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}