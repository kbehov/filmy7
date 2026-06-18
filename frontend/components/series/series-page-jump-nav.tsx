import { cn } from '@/lib/utils'

const linkClass = cn(
  'inline-flex items-center rounded-full border border-border/60 bg-card/60 px-3 py-1.5',
  'text-xs font-medium text-foreground/90 shadow-sm backdrop-blur-sm transition-colors',
  'hover:border-primary/35 hover:bg-primary/5 hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export function SeriesPageJumpNav({
  showSeasonLink,
}: {
  /** Show anchor to the seasons strip when there is more than one season. */
  showSeasonLink: boolean
}) {
  return (
    <nav
      aria-label="Szybki przejście do sekcji"
      className="mx-auto w-full max-w-6xl px-6 pt-3 md:pt-5"
    >
      <ul className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
        <li>
          <a href="#watch" className={linkClass}>
            Oglądaj
          </a>
        </li>
        {showSeasonLink ? (
          <li>
            <a href="#seasons" className={linkClass}>
              Sezony
            </a>
          </li>
        ) : null}
        <li>
          <a href="#info" className={linkClass}>
            O serialu
          </a>
        </li>
        <li>
          <a href="#episodes" className={linkClass}>
            Odcinki
          </a>
        </li>
        <li>
          <a href="#cast" className={linkClass}>
            Aktorzy
          </a>
        </li>
      </ul>
    </nav>
  )
}
