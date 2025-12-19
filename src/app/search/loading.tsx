export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-64 bg-gray-200 rounded mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-100 rounded" />
                    <div className="h-12 bg-gray-100 rounded" />
                    <div className="h-12 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="h-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-16 bg-gray-100 rounded" />
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-100 rounded" />
                    <div className="h-12 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
