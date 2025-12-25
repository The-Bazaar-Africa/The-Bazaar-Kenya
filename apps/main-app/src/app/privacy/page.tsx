'use client';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 mb-6">Last updated: December 2024</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-400 mb-4">We collect information you provide directly to us, such as:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information</li>
                <li>Order history and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-400 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and updates</li>
                <li>Provide customer support</li>
                <li>Improve our services and user experience</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <p className="text-gray-400">
                We share your information with vendors to fulfill your orders and with payment processors 
                to complete transactions. We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p className="text-gray-400">
                We implement appropriate security measures to protect your personal information. 
                All payment transactions are encrypted using SSL technology.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies</h2>
              <p className="text-gray-400">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-400 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="text-gray-400">
                For privacy-related inquiries, please contact us at privacy@thebazaar.ke
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
