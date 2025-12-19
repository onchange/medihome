export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          role="status"
          aria-label="読み込み中"
        />
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}
