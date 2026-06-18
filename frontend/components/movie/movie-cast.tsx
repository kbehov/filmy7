import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types/movies.types'
import Link from 'next/link'

function initialsOf(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
}

export function MovieCast({ movie, heading = 'Aktorzy filmu' }: { movie: Movie; heading?: string }) {
  const cast = (movie.actors ?? []).filter(a => a?.name)
  if (cast.length === 0) return null

  return (
    <div id="cast" className="scroll-mt-28">
      <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">{heading}</p>

      <ul className={cn('mt-5 grid grid-cols-3 gap-x-3 gap-y-5', 'sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6')}>
        {cast.map(actor => (
          <Link href={`/actor/${actor.slug}`} key={actor.name} className="flex flex-col items-center gap-2 text-center">
            <Avatar className={cn('size-20 ring-1 ring-white/10', 'transition-all duration-300 hover:ring-white/25')}>
              <AvatarImage src={actor.avatar} alt={actor.name} className="object-cover object-top" />
              <AvatarFallback className="bg-background text-sm font-semibold tracking-wide text-foreground">
                {initialsOf(actor.name)}
              </AvatarFallback>
            </Avatar>
            <p className="line-clamp-2 text-[0.78rem] leading-snug font-medium text-foreground/90">{actor.name}</p>
          </Link>
        ))}
      </ul>
    </div>
  )
}
