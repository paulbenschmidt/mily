import Link from 'next/link';

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-info-50 to-primary-100">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Mily</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="btn-text"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-primary"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-secondary-900 mb-6">
            Your Life, Your Timeline
          </h2>
          <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
            Record and reflect on your life events. Create a beautiful timeline
            of your major moments, minor milestones, and precious memories.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card p-6">
              <div className="w-12 h-12 category-major rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Major Events</h3>
              <p className="text-secondary-600">Life-changing moments like graduations, weddings, and career milestones.</p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 category-minor rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Minor Milestones</h3>
              <p className="text-secondary-600">Important achievements and personal growth moments worth remembering.</p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 category-memory rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Precious Moments</h3>
              <p className="text-secondary-600">Small but meaningful experiences that bring joy and reflection.</p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/signup"
              className="btn-primary-lg inline-block"
            >
              Start Your Timeline
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
