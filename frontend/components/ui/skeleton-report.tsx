function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export function SkeletonReport() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <Block className="h-7 w-56" />
        <Block className="mt-3 h-4 w-80" />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-2">
            <Block className="h-3 w-24" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-11/12" />
            <Block className="h-4 w-10/12" />
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <Block className="h-3 w-28" />
            <Block className="mt-3 h-5 w-40" />
            <Block className="mt-2 h-4 w-full" />
            <Block className="mt-2 h-4 w-5/6" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-6">
            <Block className="h-5 w-44" />
            <Block className="mt-3 h-4 w-full" />
            <Block className="mt-2 h-4 w-11/12" />
            <div className="mt-4 flex gap-2">
              <Block className="h-6 w-24 rounded-full" />
              <Block className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

