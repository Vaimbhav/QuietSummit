export default function FutureOfferings() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-neutral-900 mb-8">Future Offerings</h1>
      
      <p className="text-lg text-neutral-700 mb-12">
        We're constantly evolving. Here's what's coming next on the QuietSummit journey.
      </p>

      <div className="space-y-8">
        <div className="bg-neutral-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Custom Trip Planning</h3>
          <p className="text-neutral-700 mb-4">
            Work with our AI-powered planner to create your perfect journey, tailored to your
            preferences, timeline, and budget.
          </p>
          <span className="text-sm text-primary-600 font-semibold">Coming Soon</span>
        </div>

        <div className="bg-neutral-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Community Platform</h3>
          <p className="text-neutral-700 mb-4">
            Connect with fellow quiet believers, share stories, and plan group journeys together.
          </p>
          <span className="text-sm text-primary-600 font-semibold">In Development</span>
        </div>

        <div className="bg-neutral-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Wellness Retreats</h3>
          <p className="text-neutral-700 mb-4">
            Specialized programs combining nature, mindfulness, and personal growth.
          </p>
          <span className="text-sm text-primary-600 font-semibold">2026</span>
        </div>

        <div className="bg-neutral-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Mobile App</h3>
          <p className="text-neutral-700 mb-4">
            Access itineraries, connect with guides, and document your journey on the go.
          </p>
          <span className="text-sm text-primary-600 font-semibold">Planned</span>
        </div>
      </div>
    </div>
  )
}
