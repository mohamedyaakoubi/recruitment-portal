import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-[#003A70] dark:text-blue-400">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-[#003A70] text-white font-semibold rounded-lg hover:bg-[#002B54] transition-colors"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
}
