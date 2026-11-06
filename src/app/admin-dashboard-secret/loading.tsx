export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900 md:p-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-10 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="mb-2 h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-8 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 h-6 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex space-x-4 border-b border-gray-200 py-3 dark:border-gray-700"
            >
              <div className="h-4 flex-1 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
