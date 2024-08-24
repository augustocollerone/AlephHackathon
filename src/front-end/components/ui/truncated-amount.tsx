import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const TruncatedAmount = ({ amount }: { amount: string | number }) => {
  const formattedAmount = parseFloat(amount.toString()).toLocaleString('en-US', { maximumFractionDigits: 6 })
  const displayAmount = formattedAmount.length > 10 ? `${formattedAmount.slice(0, 7)}...` : formattedAmount

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{displayAmount}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formattedAmount}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}