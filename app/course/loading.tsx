export default function CourseLoading() {
  return (
    <div
      className="min-h-[70vh] px-4 pb-16 pt-8 md:px-6"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <div className="h-4 w-56 rounded bg-white/15" />
            <div className="h-12 max-w-xl rounded bg-white/15" />
            <div className="h-5 max-w-lg rounded bg-white/10" />
            <div className="h-5 max-w-md rounded bg-white/10" />
            <div className="h-11 w-44 rounded-[3px] bg-[#F86531]/25" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-[2px] border border-white/[0.08] bg-[#13324F]/20"
              />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading course...</span>
    </div>
  );
}
