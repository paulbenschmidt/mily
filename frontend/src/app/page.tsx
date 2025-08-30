import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mily</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <SignedOut>
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Your Life, Your Timeline
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Record and reflect on your life events. Create a beautiful timeline 
              of your major moments, minor milestones, and precious memories.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-green-600 text-xl">📅</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Major Events</h3>
                <p className="text-gray-600">Life-changing moments like graduations, weddings, and career milestones.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-blue-600 text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Minor Milestones</h3>
                <p className="text-gray-600">Important achievements and personal growth moments worth remembering.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-purple-600 text-xl">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Precious Moments</h3>
                <p className="text-gray-600">Small but meaningful experiences that bring joy and reflection.</p>
              </div>
            </div>

            <div className="mt-12">
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors">
                  Start Your Timeline
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Timeline
            </h2>
            <p className="text-gray-600 mb-8">
              Ready to start recording your life events?
            </p>
            <div className="bg-white p-8 rounded-xl shadow-sm max-w-md mx-auto">
              <p className="text-gray-500 mb-4">Your timeline is ready to be created!</p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Create Timeline
              </button>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
