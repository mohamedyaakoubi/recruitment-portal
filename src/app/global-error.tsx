"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Critical Error
                        </h2>
                        <p className="text-gray-600 mb-6">
                            A critical error has occurred. Please refresh the page.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
