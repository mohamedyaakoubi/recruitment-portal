'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Critical Error</h2>
            <p className="mb-6 text-gray-600">
              A critical error has occurred. Please refresh the page.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
