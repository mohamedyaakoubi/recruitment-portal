import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-[#003A70] dark:text-blue-400">404</h1>
        <h2 className="mb-4 mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-[#003A70] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#002B54]"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
