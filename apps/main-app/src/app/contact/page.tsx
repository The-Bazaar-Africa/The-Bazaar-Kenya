'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Label, Textarea } from '@tbk/ui';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log('Contact form:', formData);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@thebazaar.ke',
      href: 'mailto:support@thebazaar.ke',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+254 700 000 000',
      href: 'tel:+254700000000',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Nairobi, Kenya',
      href: '#',
    },
  ];

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 to-transparent" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question or need help? We&apos;re here for you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <Card key={info.title} className="bg-netflix-dark-gray border-netflix-medium-gray">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-netflix-red/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-netflix-red" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{info.title}</h3>
                      <a href={info.href} className="text-gray-400 hover:text-netflix-red transition-colors">
                        {info.value}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Live Chat */}
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Live Chat</h3>
                    <p className="text-gray-400 text-sm">Available 24/7</p>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-400 min-h-[150px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-netflix-red hover:bg-netflix-red/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
