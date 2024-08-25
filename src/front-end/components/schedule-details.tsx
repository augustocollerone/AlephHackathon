import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { Label as RechartsLabel, LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from './ui/progress';
import { ASSETS } from '@/contracts/swapContracts';
import { Label } from './ui/label';
import { useAccount, useConfig, usePublicClient, useWatchContractEvent } from 'wagmi';
import deployedContracts from '@/contracts/deployedContracts';
import { decodeEventLog } from 'viem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from './ui/skeleton';

const chartConfigRadar = {
  percentage: {
    label: "Percentage",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const chartConfig = {
  amountSwapped: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ScheduleDetailsProp {
  id: string;
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
  const { address: accountAddress } = useAccount();
  const [executedCount, setExecutedCount] = useState(0);
  const [swapData, setSwapData] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const config = useConfig();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!publicClient) return;

      const logs = await publicClient.getLogs({
        address: deployedContracts.DCAScheduler.address,
        event: {
          type: 'event',
          name: 'DcaTaskExecuted',
          inputs: [
            { type: 'address', name: 'user', indexed: true },
            { type: 'uint256', name: 'taskId' },
            {
              type: 'tuple[]',
              name: 'swaps',
              components: [
                { type: 'address', name: 'tokenIn' },
                { type: 'address', name: 'tokenOut' },
                { type: 'uint256', name: 'amountIn' },
                { type: 'uint256', name: 'amountOut' }
              ]
            },
            { type: 'uint256', name: 'fee' },
            { type: 'address', name: 'feeToken' }
          ]
        },
        args: {
          user: accountAddress,
        },
        fromBlock: BigInt(0),
      });

      const relevantLogs = logs.filter(log => {
        const decodedLog = decodeEventLog({
          abi: deployedContracts.DCAScheduler.abi,
          data: log.data,
          topics: log.topics,
        });
        return decodedLog.args.taskId === BigInt(schedule.id);
      });

      setExecutedCount(relevantLogs.length);

      const groupedSwapData = await relevantLogs.reduce(async (accPromise, log) => {
        const acc = await accPromise;
        const decodedLog = decodeEventLog({
          abi: deployedContracts.DCAScheduler.abi,
          data: log.data,
          topics: log.topics,
        });

        if ('swaps' in decodedLog.args) {
          decodedLog.args.swaps.forEach((swap: any) => {
            const tokenOut = swap.tokenOut.toLowerCase();
            if (!acc[tokenOut]) {
              acc[tokenOut] = [];
            }

            acc[tokenOut].push({
              date,
              amountSwapped: Number(swap.amountOut) / 1e18 // Assuming 18 decimals, adjust if needed
            });
          });
        }

        const block = await publicClient.getBlock({ blockHash: log.blockHash });
        const date = new Date(Number(block.timestamp) * 1000).toISOString();

        return acc;
      }, Promise.resolve({} as Record<string, Array<{date: string, amountSwapped: number}>>));

      const formattedSwapData = Object.entries(groupedSwapData).map(([tokenOut, data]) => ({
        tokenOut,
        data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }));

      setSwapData(formattedSwapData);
      if (formattedSwapData.length > 0) {
        setSelectedAsset(formattedSwapData[0].tokenOut);
      }
    };

    fetchLogs();
  }, [publicClient, accountAddress, schedule.id]);

  const chartDataPie = schedule.outputSwaps.map(swap => {
    const asset = ASSETS.find(asset => asset.address.toLowerCase() === swap.token.toLowerCase());
    return {
      name: asset ? asset.name : 'Unknown',
      value: swap.percentage,
    };
  });

  const selectedAssetData = swapData.find(data => data.tokenOut === selectedAsset);
  const selectedAssetName = ASSETS.find(asset => asset.address.toLowerCase() === selectedAsset?.toLowerCase())?.name || 'Unknown';
  const selectedAssetIndex = swapData.findIndex(data => data.tokenOut === selectedAsset);

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
          <Progress value={(executedCount / Number(schedule.maxCount)) * 100} />
          <Label>
            {executedCount} of {schedule.maxCount.toString()} swaps done - Next on {new Date(Number(schedule.lastExecuted) * 1000 + Number(schedule.interval)).toLocaleDateString(undefined, { day: '2-digit', month: 'long' }).split(' ').join(' ')}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 overflow-y-auto">

        <div>
          <h3 className="text-lg font-semibold mb-2">Swap Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Current allocation percentages</p>
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
                animationDuration={1500}
              >
                {chartDataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Pie
                  data={chartDataPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={100}
                  strokeWidth={5}
                >
                </Pie>
                <RechartsLabel
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const totalAmount = Number(schedule.amount) / 1e6; // Assuming amount is in USDC (6 decimals)
                      return (
                        <text
                          x={viewBox?.cx}
                          y={viewBox?.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox?.cy ? viewBox.cy - 10 : 0}
                            className="fill-foreground text-2xl font-bold"
                          >
                            ${totalAmount.toFixed(2)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox?.cy ? viewBox.cy + 15 : 0}
                            className="fill-muted-foreground text-sm"
                          >
                            USDC
                          </tspan>
                        </text>
                      )
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Amount Swapped</h3>
          <p className="text-sm text-muted-foreground mb-4">Historical swap data</p>
          {swapData.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-[36px] w-[180px]" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <Select
                value={selectedAsset || undefined}
                onValueChange={(value) => setSelectedAsset(value)}
              >
                <SelectTrigger className="w-[180px] mb-4">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {swapData.map((assetData, index) => {
                    const asset = ASSETS.find(a => a.address.toLowerCase() === assetData.tokenOut.toLowerCase());
                    const assetName = asset ? asset.name : 'Unknown';
                    return (
                      <SelectItem key={assetData.tokenOut} value={assetData.tokenOut}>
                        {assetName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedAssetData && (
                <ChartContainer config={chartConfig}>
                  <LineChart
                    data={selectedAssetData.data}
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
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = date.toLocaleString('default', { month: 'short' });
                        return `${day} ${month}`;
                      }}
                    />
                    <ChartTooltip 
                      cursor={false} 
                      content={<ChartTooltipContent 
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleString();
                        }}
                      />} 
                    />
                    <Line
                      type="monotone"
                      dataKey="amountSwapped"
                      stroke={COLORS[selectedAssetIndex % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ChartContainer>
              )}
              <div className="mt-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  Historical swap data for {selectedAssetName}
                </p>
                <p className="text-muted-foreground">
                  Showing amount swapped over time
                </p>
              </div>
            </>
          )}
        </div>

      </CardContent>
    </Card>
  );
}