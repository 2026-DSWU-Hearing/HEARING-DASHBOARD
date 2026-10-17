interface DeviceStatusCardPropTypes {
  currentMode: string
  isDeviceConnected: boolean
  batteryPercent: number | null
  isDeviceActiveUser: boolean
}

const LOW_BATTERY_PERCENT = 20

const DeviceStatusCard = ({
  currentMode,
  isDeviceConnected,
  batteryPercent,
  isDeviceActiveUser,
}: DeviceStatusCardPropTypes) => {
  const clampedBattery = batteryPercent === null ? null : Math.min(100, Math.max(0, batteryPercent))
  const isLowBattery = clampedBattery !== null && clampedBattery <= LOW_BATTERY_PERCENT

  return (
    <section className="dash-card grid grid-cols-[1.2fr_1fr_1fr] divide-x divide-white/6 px-2 py-4">
      <div className="min-w-0 px-4">
        <p className="dash-eyebrow">현재 모드</p>
        <div className="border-dash-accent/40 bg-dash-accent/10 mt-1.5 inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-1">
          <span aria-hidden="true" className="bg-dash-accent size-2 rounded-full" />
          <span className="text-dash-title text-dash-accent truncate leading-tight font-bold">
            {currentMode}
          </span>
        </div>
      </div>

      <div className="min-w-0 px-4">
        <p className="dash-eyebrow">넥밴드 연결</p>
        <p className="text-dash-title text-dash-text mt-1.5 flex items-center gap-2.5 leading-tight font-semibold">
          <span
            aria-hidden="true"
            className={`size-3 shrink-0 rounded-full ${
              isDeviceConnected ? 'bg-dash-success animate-dot-pulse' : 'bg-dash-emergency'
            }`}
          />
          {isDeviceConnected ? '연결됨' : '연결 끊김'}
        </p>
        {isDeviceConnected && !isDeviceActiveUser && (
          <p className="text-dash-caption text-dash-emergency mt-1">
            다른 계정이 사용 중 · 앱에서 [기기 연결] 필요
          </p>
        )}
      </div>

      <div className="min-w-0 px-4">
        <p className="dash-eyebrow">배터리</p>
        <p className="text-dash-title text-dash-text mt-1.5 leading-tight font-semibold tabular-nums">
          {clampedBattery === null ? '—' : `${clampedBattery}%`}
        </p>
        <div
          role="progressbar"
          aria-valuenow={clampedBattery ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8"
        >
          <div
            className={`h-full rounded-full ${isLowBattery ? 'bg-dash-emergency' : 'bg-dash-success'}`}
            style={{ width: `${clampedBattery ?? 0}%` }}
          />
        </div>
      </div>
    </section>
  )
}

export default DeviceStatusCard
