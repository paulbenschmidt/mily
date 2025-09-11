export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Timeline</h1>
          <p className="text-gray-600 mt-2">Ready to start recording your life events?</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📅</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Add Major Event</h3>
                    <p className="text-sm text-gray-600">Life-changing moments</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Add Minor Milestone</h3>
                    <p className="text-sm text-gray-600">Personal achievements</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">✨</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Add Memory</h3>
                    <p className="text-sm text-gray-600">Precious moments</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-lg">👁️</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Timeline</h3>
                    <p className="text-sm text-gray-600">See your journey</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Events Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📝</span>
              </div>
              <p className="text-gray-500 mb-4">No events yet</p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Create Your First Event
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Events</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Major Events</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Milestones</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memories</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Account Created</p>
                  <p className="text-xs text-gray-600">Welcome to Mily!</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-400 text-xs">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Add Your First Event</p>
                  <p className="text-xs text-gray-600">Start building your timeline</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-400 text-xs">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Explore Timeline View</p>
                  <p className="text-xs text-gray-600">See your events in chronological order</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
