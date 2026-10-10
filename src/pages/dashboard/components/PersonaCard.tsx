import type { PersonaTypes } from '../types/dashboardTypes'

interface PersonaCardPropTypes {
  persona: PersonaTypes
}

const PersonaCard = ({ persona }: PersonaCardPropTypes) => {
  const { name, description } = persona
  const initial = name.slice(0, 1)

  return (
    <section className="border-dash-border bg-dash-surface flex items-center gap-4 rounded-2xl border px-5 py-4">
      <div
        aria-hidden="true"
        className="bg-dash-accent text-dash-title text-dash-bg flex size-14 shrink-0 items-center justify-center rounded-full font-bold"
      >
        {initial}
      </div>
      <div className="min-w-0">
        <p className="text-dash-label text-dash-muted">시연 페르소나</p>
        <h2 className="text-dash-title text-dash-text truncate font-bold">{name}</h2>
        <p className="text-dash-body text-dash-muted truncate">{description}</p>
      </div>
    </section>
  )
}

export default PersonaCard
