export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-6 sm:px-6 lg:py-8">
      <div className="h-7 w-36 rounded-lg bg-surface-3" />
      <div className="mt-2 h-4 w-64 max-w-full rounded bg-surface-2" />
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
              <div className="size-11 rounded-full bg-surface-3" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-surface-3" />
                <div className="h-3 w-1/3 rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden h-64 rounded-2xl border border-border bg-surface lg:block" />
      </div>
    </div>
  );
}
