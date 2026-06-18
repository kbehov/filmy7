export default function SearchLoading() {
  return (
    <div className="min-h-svh p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 lg:gap-10">
        <div className="border-b border-border pb-10 md:pb-12">
          <div className="h-10 max-w-md animate-pulse rounded-lg bg-muted md:h-12 md:max-w-lg" />
          <div className="mt-4 h-4 max-w-xl animate-pulse rounded bg-muted/70" />
          <div className="mt-6 h-4 w-40 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="h-12 w-full max-w-2xl animate-pulse rounded-full bg-muted/80" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-2/3 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
