import type { PersonaTypes } from '../types/dashboardTypes'

interface PersonaCardPropTypes {
  persona: PersonaTypes
}

const PersonaCard = ({ persona }: PersonaCardPropTypes) => {
  const { name, description } = persona
  const initial = name.slice(0, 1)

  return (
    <section className="dash-card flex items-center gap-4 px-5 py-4">
      <div className="relative shrink-0">
        <div
          aria-hidden="true"
          className="text-dash-title text-dash-bg flex size-14 items-center justify-center rounded-full bg-[linear-gradient(145deg,#ffe36b,#f4b400)] font-bold shadow-[0_8px_20px_-8px_rgba(255,212,59,0.7)]"
        >
          {initial}
        </div>
        <span
          aria-hidden="true"
          className="bg-dash-success border-dash-surface absolute -right-0.5 -bottom-0.5 size-4 rounded-full border-2"
        />
      </div>
      <div className="min-w-0">
        <p className="dash-eyebrow">착용자</p>
        <h2 className="text-dash-title text-dash-text truncate leading-tight font-bold">{name}</h2>
        <p className="text-dash-label text-dash-muted truncate">{description}</p>
      </div>
    </section>
  )
}

export default PersonaCard
