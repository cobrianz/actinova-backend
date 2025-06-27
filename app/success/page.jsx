export default function SuccessPage() {
    return (
      <div className="min-h-screen flex items-center justify-center  dark:from-gray-900 dark:to-gray-800 p-4">
        <div className=" text-center bg-white dark:bg-gray-800 p-10">
          <h1 className="text-6xl font-bold text-green-600 dark:text-green-400 mb-4">🎉 Registration Successful!</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Thank you for signing up. Your account request is under review.
            Please allow up to <strong>24 hours</strong> for approval.
          </p>
          <a
            href="/"
            className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Explore our services
          </a>
        </div>
      </div>
    )
  }
  