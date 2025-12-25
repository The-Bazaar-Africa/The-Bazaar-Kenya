'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Textarea, Separator } from '@tbk/ui';
import { Store, CheckCircle, ArrowRight, Upload } from 'lucide-react';

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    description: '',
    category: '',
    location: '',
  });

  const benefits = [
    'Reach thousands of customers across Kenya',
    'Easy-to-use dashboard to manage your products',
    'Secure payment processing',
    'Marketing tools to grow your business',
    'Dedicated vendor support team',
    'Low commission rates',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement vendor registration
    console.log('Vendor registration:', formData);
    setStep(3); // Success step
  };

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 to-transparent" />
        <div className="container-custom relative z-10 text-center">
          <Store className="h-16 w-16 text-netflix-red mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Become a Vendor
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join The Bazaar and start selling to thousands of customers across Kenya. 
            It&apos;s free to get started!
          </p>
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Why Sell on The Bazaar?</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-netflix-red mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            <Card className="bg-netflix-dark-gray border-netflix-medium-gray mt-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Commission Structure</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Standard Commission</span>
                    <span className="text-white font-semibold">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Premium Vendors</span>
                    <span className="text-white font-semibold">7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Fee</span>
                    <span className="text-green-400 font-semibold">Free</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div>
            {step === 1 && (
              <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
                <CardHeader>
                  <CardTitle className="text-white">Business Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tell us about your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-white">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="Your business name"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Business Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+254 700 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, Kenya"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-netflix-red hover:bg-netflix-red/90">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
                <CardHeader>
                  <CardTitle className="text-white">Business Details</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tell customers about what you sell
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">Primary Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-netflix-medium-gray border border-netflix-medium-gray rounded-md p-2 text-white"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home & Garden</option>
                        <option value="beauty">Beauty & Health</option>
                        <option value="sports">Sports & Outdoors</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">Business Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell customers about your business and products..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Business Logo</Label>
                      <div className="border-2 border-dashed border-netflix-medium-gray rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 rounded border-netflix-medium-gray" required />
                      <span className="text-sm text-gray-400">
                        I agree to the{' '}
                        <Link href="/vendor-terms" className="text-netflix-red hover:underline">Vendor Terms</Link>
                        {' '}and{' '}
                        <Link href="/terms" className="text-netflix-red hover:underline">Terms of Service</Link>
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-netflix-red hover:bg-netflix-red/90">
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
                  <p className="text-gray-400 mb-6">
                    Thank you for applying to become a vendor on The Bazaar. 
                    We&apos;ll review your application and get back to you within 2-3 business days.
                  </p>
                  <Button className="bg-netflix-red hover:bg-netflix-red/90" asChild>
                    <Link href="/">Return to Home</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
