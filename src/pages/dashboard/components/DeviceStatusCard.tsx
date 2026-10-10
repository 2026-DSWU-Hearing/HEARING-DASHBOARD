interface DeviceStatusCardPropTypes {
  currentMode: string
  isDeviceConnected: boolean
  batteryPercent: number
}

const LOW_BATTERY_PERCENT = 20

const DeviceStatusCard = ({
  currentMode,
  isDeviceConnected,
  batteryPercent,
}: DeviceStatusCardPropTypes) => {
  const clampedBattery = Math.min(100, Math.max(0, batteryPercent))
  const isLowBattery = clampedBattery <= LOW_BATTERY_PERCENT

  return (
    <section className="border-dash-border bg-dash-surface grid grid-cols-3 gap-3 rounded-2xl border px-5 py-4">
      <div className="min-w-0">
        <p className="text-dash-label text-dash-muted">현재 모드</p>
        <p className="text-dash-metric text-dash-accent truncate leading-tight font-bold">
          {currentMode}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-dash-label text-dash-muted">넥밴드 연결</p>
        <p className="text-dash-title text-dash-text flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className={`size-3.5 rounded-full ${
              isDeviceConnected
                ? 'bg-dash-success shadow-[0_0_12px_var(--color-dash-success)]'
                : 'bg-dash-emergency'
            }`}
          />
          {isDeviceConnected ? '연결됨' : '연결 끊김'}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-dash-label text-dash-muted">배터리</p>
        <p className="text-dash-title text-dash-text font-semibold">{`${clampedBattery}%`}</p>
        <div
          role="progressbar"
          aria-valuenow={clampedBattery}
          aria-valuemin={0}
          aria-valuemax={100}
          className="bg-dash-raised mt-1.5 h-2 w-full overflow-hidden rounded-full"
        >
          <div
            className={`h-full rounded-full ${isLowBattery ? 'bg-dash-emergency' : 'bg-dash-success'}`}
            style={{ width: `${clampedBattery}%` }}
          />
        </div>
      </div>
    </section>
  )
}

export default DeviceStatusCard
