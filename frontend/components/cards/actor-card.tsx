import { cn } from "@/lib/utils"
import type { Actor } from "@/types/actor.types"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

function moviesCountLabel(count: number): string {
  if (count === 1) return "1 film"
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} filmy`
  }
  return `${count} filmów`
}

export default function ActorCard({
  actor,
  className,
}: {
  actor: Actor
  className?: string
}) {
  const countLabel =
    typeof actor.moviesCount === "number" && actor.moviesCount > 0
      ? moviesCountLabel(actor.moviesCount)
      : null

  const initials = actor.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join("")

  return (
    <Link
      href={`/actor/${actor.slug}`}
      title={actor.name}
      className={cn(
        "group relative flex flex-col items-center gap-3 outline-none",
        "rounded-xl focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className
      )}
    >
      {/* Avatar ring + glow */}
      <div className="relative">
        {/* Animated ring on hover */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-[-3px] rounded-full",
            "bg-linear-to-br from-white/30 via-white/5 to-transparent",
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          )}
        />

        {/* Glow behind avatar */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full blur-lg",
            "scale-90 bg-white/10",
            "opacity-0 transition-all duration-300",
            "group-hover:scale-110 group-hover:opacity-100"
          )}
        />

        <Avatar
          size="lg"
          className={cn(
            "relative ring-1 ring-white/10",
            "size-24!",
            "transition-all duration-300 ease-out",
            "group-hover:scale-[1.06] group-hover:ring-white/30"
          )}
        >
          <AvatarImage
            src={actor.avatar}
            alt={actor.name}
            className="object-cover object-top"
          />
          <AvatarFallback className="bg-zinc-800 text-lg font-semibold tracking-wide text-zinc-300">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name + count */}
      <div className="flex w-full min-w-0 flex-col items-center gap-0.5 px-1">
        <h3
          className={cn(
            "line-clamp-2 text-center text-[0.82rem] leading-snug font-semibold tracking-tight",
            "text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
          )}
        >
          {actor.name}
        </h3>

        {countLabel && (
          <p
            className={cn(
              "text-[0.68rem] text-zinc-600 tabular-nums",
              "transition-colors duration-200 group-hover:text-zinc-400"
            )}
          >
            {countLabel}
          </p>
        )}
      </div>
    </Link>
  )
}
