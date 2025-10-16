import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scarlet Points | Loyalty Program',
  description: 'Earn and redeem Scarlet Points with every purchase. Join our loyalty program and get exclusive rewards.',
};

export default function PointsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Scarlet Points
            </h1>
            <p className="text-xl text-gray-600">
              Earn points with every purchase and redeem them for exclusive rewards
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Coming Soon!
              </h2>
              <p className="text-gray-600 mb-6">
                Our loyalty program is currently under development. Stay tuned for exciting rewards and exclusive benefits!
              </p>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-950 mb-2">🎯 Earn Points</h3>
                  <p className="text-red-800 text-sm">Get points for every purchase, reviews, and referrals</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-950 mb-2">🎁 Redeem Rewards</h3>
                  <p className="text-red-800 text-sm">Use your points for discounts, free products, and exclusive items</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-950 mb-2">⭐ VIP Benefits</h3>
                  <p className="text-red-800 text-sm">Unlock special perks and early access to new products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
