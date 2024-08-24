import { Button } from "./button"

export enum TimeFrame {
  DAILY = "Daily",
  WEEKLY = "Weekly",
  BIWEEKLY = "Bi-weekly",
  MONTHLY = "Monthly",
}

const TimeFrameSelector = ({ value, onChange }: { value: TimeFrame; onChange: (value: TimeFrame) => void }) => {
  const timeFrames = [
    { value: TimeFrame.DAILY, label: "Daily" },
    { value: TimeFrame.WEEKLY, label: "Weekly" },
    { value: TimeFrame.BIWEEKLY, label: "Bi-weekly" },
    { value: TimeFrame.MONTHLY, label: "Monthly" },
  ]

  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
      {timeFrames.map((frame) => (
        <Button
          key={frame.value}
          variant={value === frame.value ? "default" : "outline"}
          className="w-full md:flex-1 px-2 sm:px-4 text-xs sm:text-sm"
          onClick={() => onChange(frame.value)}
        >
          {frame.value === TimeFrame.BIWEEKLY ? (
            <span className="md:hidden">Bi-week</span>
          ) : (
            <span className="md:hidden">{frame.label}</span>
          )}
          <span className="hidden md:inline">{frame.label}</span>
        </Button>
      ))}
    </div>
  )
}

export default TimeFrameSelector