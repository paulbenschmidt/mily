export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      {/* TODO: Add conditional header banner when no events exist */}
      {/* <div className="border-b border-gray-100 px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Timeline</h1>
          <p className="text-gray-600 mt-2">Ready to start recording your life events?</p>
        </div>
      </div> */}

      {/* Main Timeline Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Timeline Line */}
        <div className="w-20 flex justify-center pt-12">
          <div className="w-0.5 bg-gray-300 h-full relative">
            {/* Birth Event Dot */}
            <div className="absolute top-0 -left-2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 pt-12 pr-8">
          {/* Birth Event */}
          <div className="mb-16 flex justify-center">
            <div className="bg-gray-50 rounded-lg p-4 max-w-sm text-center">
              <h3 className="font-medium text-gray-900">Birth</h3>
              <p className="text-sm text-gray-600 mt-1">Your journey begins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Button - On timeline at bottom */}
      <div className="relative">
        <div className="absolute left-20 -top-8 -translate-x-1/2">
          <button className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-colors group">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
