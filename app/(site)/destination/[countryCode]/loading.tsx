export default function DestinationLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true">
      <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900 rounded" />
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
        <div className="h-9 w-56 bg-zinc-100 dark:bg-zinc-900 rounded" />
      </div>
      <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
      </div>
    </div>
  );
}
