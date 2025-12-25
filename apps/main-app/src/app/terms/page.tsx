'use client';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 mb-6">Last updated: December 2024</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-400">
                By accessing and using The Bazaar marketplace, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use of Service</h2>
              <p className="text-gray-400">
                You must be at least 18 years old to use The Bazaar. You are responsible for maintaining 
                the confidentiality of your account and password. You agree to accept responsibility for 
                all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Products and Vendors</h2>
              <p className="text-gray-400">
                The Bazaar is a marketplace platform connecting buyers with independent vendors. 
                We do not manufacture, store, or ship products directly. Each vendor is responsible 
                for their product listings, pricing, and fulfillment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Payments</h2>
              <p className="text-gray-400">
                All payments are processed securely through our payment partners. Prices are displayed 
                in Kenyan Shillings (KES) unless otherwise specified. You agree to pay all charges 
                incurred through your account at the prices in effect when such charges are incurred.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Returns and Refunds</h2>
              <p className="text-gray-400">
                Return policies may vary by vendor. Please review each vendor&apos;s return policy before 
                making a purchase. The Bazaar will assist in resolving disputes between buyers and vendors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-400">
                All content on The Bazaar, including logos, text, graphics, and software, is the property 
                of The Bazaar or its content suppliers and is protected by intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-400">
                The Bazaar shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
              <p className="text-gray-400">
                If you have any questions about these Terms, please contact us at legal@thebazaar.ke
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
