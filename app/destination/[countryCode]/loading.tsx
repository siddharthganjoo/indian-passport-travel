export default function DestinationLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      <div className="h-80 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-850 rounded-2xl" />
        ))}
      </div>
      <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-850 rounded-2xl" />
      <div className="h-72 w-full bg-zinc-100 dark:bg-zinc-850 rounded-2xl" />
    </div>
  );
}
