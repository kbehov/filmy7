import { Separator } from '@/components/ui/separator'
import { Clapperboard, Film, Popcorn, Sparkles, Tv } from 'lucide-react'
import Link from 'next/link'

const exploreLinks = [
  { label: 'Główna', href: '/' },
  { label: 'Wszystkie filmy', href: '/filmi' },
  { label: 'Wszystkie seriale', href: '/seriali' },
] as const

const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-border/60 bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,var(--color-primary)/12%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-12 pb-10 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <Clapperboard className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground">FilmiPL</p>
                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                  Filmy i seriale jednym kliknięciem
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
              Znajdź swój następny film z wygodnym odtwarzaczem i napisami. Rejestracja nie jest wymagana — wybierz i
              oglądaj.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <Film className="size-3.5 text-primary" aria-hidden />
                Obraz w jakości HD
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <Tv className="size-3.5 text-primary" aria-hidden />
                Seriale na maraton
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <Popcorn className="size-3.5 text-primary" aria-hidden />
                Polecana selekcja
              </span>
            </div>
          </div>

          <nav className="lg:col-span-3" aria-label="Szybkie linki">
            <p className="text-sm font-medium tracking-wide text-foreground">Szybkie linki</p>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="my-10 bg-linear-to-r from-transparent via-border to-transparent" />

        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-primary/80" aria-hidden />
            <span>© {new Date().getFullYear()} FilmiPL. Wszelkie prawa zastrzeżone.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
