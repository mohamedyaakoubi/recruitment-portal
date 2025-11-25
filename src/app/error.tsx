"use client";

import { useEffect } from "react";
import logger from "@/lib/logger";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Application error occurred", error, { digest: error.digest });
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <svg
                        className="mx-auto h-16 w-16 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                <div className="space-x-4">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-[#003A70] text-white font-semibold rounded-lg hover:bg-[#002B54] transition-colors"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Go home
                    </button>
                </div>
            </div>
        </div>
    );
}
