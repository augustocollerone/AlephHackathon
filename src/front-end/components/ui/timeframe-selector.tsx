import { Button } from "./button"

export enum TimeFrame {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
}

const TimeFrameSelector = ({ value, onChange }: { value: TimeFrame; onChange: (value: TimeFrame) => void }) => {
  const timeFrames = [
    { value: TimeFrame.DAILY, label: "Daily" },
    { value: TimeFrame.WEEKLY, label: "Weekly" },
    { value: TimeFrame.BIWEEKLY, label: "Bi-weekly" },
    { value: TimeFrame.MONTHLY, label: "Monthly" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {timeFrames.map((frame) => (
        <Button
          key={frame.value}
          variant={value === frame.value ? "default" : "outline"}
          className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0"
          onClick={() => onChange(frame.value)}
        >
          {frame.label}
        </Button>
      ))}
    </div>
  )
}

export default TimeFrameSelector