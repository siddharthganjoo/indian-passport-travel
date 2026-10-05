import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[50vh] flex flex-col items-center justify-center text-center gap-4 py-16">
      <p className="text-sm text-zinc-500">404</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">We couldn&apos;t find that page</h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">It may have moved. Start a new search or browse the visa guide.</p>
      <div className="flex gap-3 pt-2">
        <Link href="/" className="h-10 px-4 inline-flex items-center rounded-full bg-black text-white text-sm font-medium dark:bg-white dark:text-black">
          Plan a trip
        </Link>
        <Link href="/visas" className="h-10 px-4 inline-flex items-center rounded-full border border-zinc-300 text-sm dark:border-zinc-700">
          Visa guide
        </Link>
      </div>
    </div>
  );
}
