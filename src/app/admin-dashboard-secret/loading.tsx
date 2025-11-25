export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <div className="animate-pulse">
                {/* Header skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                    ))}
                </div>

                {/* Table skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex space-x-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
