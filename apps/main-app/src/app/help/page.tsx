'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Button, Input } from '@tbk/ui';
import { Search, ChevronDown, ChevronUp, ShoppingBag, Truck, CreditCard, RotateCcw, MessageSquare, HelpCircle } from 'lucide-react';

const faqCategories = [
  {
    icon: ShoppingBag,
    title: 'Orders',
    faqs: [
      { q: 'How do I track my order?', a: 'You can track your order by going to "My Orders" in your account dashboard. Click on the order you want to track to see its current status and tracking information.' },
      { q: 'Can I cancel my order?', a: 'You can cancel your order within 24 hours of placing it, as long as it hasn\'t been shipped yet. Go to "My Orders" and click "Cancel Order".' },
      { q: 'How long does delivery take?', a: 'Delivery times vary by location. Within Nairobi, expect 1-3 business days. Other regions may take 3-7 business days.' },
    ],
  },
  {
    icon: Truck,
    title: 'Shipping',
    faqs: [
      { q: 'What are the shipping costs?', a: 'Shipping costs depend on your location and order size. Free shipping is available for orders over KES 5,000 within Nairobi.' },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within Kenya. We\'re working on expanding to other East African countries soon.' },
      { q: 'What if my package is damaged?', a: 'If your package arrives damaged, please contact us within 48 hours with photos of the damage. We\'ll arrange a replacement or refund.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments',
    faqs: [
      { q: 'What payment methods do you accept?', a: 'We accept M-Pesa, Visa, Mastercard, and bank transfers. All payments are secure and encrypted.' },
      { q: 'Is my payment information secure?', a: 'Yes, we use industry-standard SSL encryption and never store your full card details on our servers.' },
      { q: 'Can I pay on delivery?', a: 'Cash on delivery is available for orders under KES 10,000 within Nairobi. A small COD fee may apply.' },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    faqs: [
      { q: 'What is your return policy?', a: 'You can return most items within 7 days of delivery for a full refund. Items must be unused and in original packaging.' },
      { q: 'How do I request a refund?', a: 'Go to "My Orders", select the order, and click "Request Refund". Follow the instructions to complete your return.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.' },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 to-transparent" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Help Center
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-netflix-dark-gray border-netflix-medium-gray text-white placeholder:text-gray-400 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title} className="bg-netflix-dark-gray border-netflix-medium-gray hover:border-netflix-red transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-netflix-red mx-auto mb-3" />
                  <h3 className="text-white font-semibold">{category.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="container-custom py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="h-6 w-6 text-netflix-red" />
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                </div>
                <div className="space-y-3">
                  {category.faqs.map((faq, index) => {
                    const faqId = `${category.title}-${index}`;
                    const isOpen = openFaq === faqId;
                    return (
                      <Card key={faqId} className="bg-netflix-dark-gray border-netflix-medium-gray">
                        <button
                          onClick={() => toggleFaq(faqId)}
                          className="w-full p-4 flex items-center justify-between text-left"
                        >
                          <span className="text-white font-medium">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-400">{faq.a}</p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container-custom py-12">
        <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-netflix-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
            <p className="text-gray-400 mb-6">
              Our support team is available 24/7 to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-netflix-red hover:bg-netflix-red/90" asChild>
                <Link href="/contact">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
