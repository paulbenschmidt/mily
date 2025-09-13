import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Mily</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900">Profile</button>
                <button className="text-gray-600 hover:text-gray-900">Settings</button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
