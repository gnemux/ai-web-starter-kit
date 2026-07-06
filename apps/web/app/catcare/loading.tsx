export default function CatCareLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-5">
      <div className="grid gap-3">
        <div className="h-9 w-40 rounded-2xl bg-white/80 ring-1 ring-[#e2e6ee]" />
        <div className="h-4 w-72 max-w-full rounded-full bg-white/80 ring-1 ring-[#e2e6ee]" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid gap-4 rounded-2xl border border-[#e2e6ee] bg-white p-5">
          <div className="h-36 rounded-2xl bg-[#f2fbf8]" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-28 rounded-2xl bg-[#fbfdfc] ring-1 ring-[#e2e6ee]" />
            <div className="h-28 rounded-2xl bg-[#fbfdfc] ring-1 ring-[#e2e6ee]" />
          </div>
          <div className="h-14 rounded-xl bg-[#e6f7f2]" />
        </section>

        <aside className="grid content-start gap-4">
          <div className="h-40 rounded-2xl border border-[#e2e6ee] bg-white" />
          <div className="h-40 rounded-2xl border border-[#e2e6ee] bg-white" />
        </aside>
      </div>
    </div>
  );
}
