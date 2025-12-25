'use client';

/**
 * Vendor Settings Page
 * =====================
 * Settings and profile management for vendors.
 */

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import {
  User,
  Store,
  CreditCard,
  Bell,
  Shield,
  Loader2,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';

interface VendorProfile {
  id: string;
  businessName: string;
  businessDescription: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  city: string;
  country: string;
  website: string;
  logoUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  mpesaNumber: string;
}

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

type TabType = 'profile' | 'business' | 'payments' | 'notifications' | 'security';

export default function VendorSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
  });
  const [vendorProfile, setVendorProfile] = useState<VendorProfile>({
    id: '',
    businessName: '',
    businessDescription: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    city: '',
    country: 'Kenya',
    website: '',
    logoUrl: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    mpesaNumber: '',
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserProfile({
            fullName: profile.full_name || '',
            email: session.user.email || '',
            phone: profile.phone || '',
            avatarUrl: profile.avatar_url || '',
          });

          // Fetch vendor profile
          if (profile.vendor_id) {
            const { data: vendor } = await supabase
              .from('vendors')
              .select('*')
              .eq('id', profile.vendor_id)
              .single();

            if (vendor) {
              setVendorProfile({
                id: vendor.id,
                businessName: vendor.business_name || '',
                businessDescription: vendor.description || '',
                businessEmail: vendor.email || '',
                businessPhone: vendor.phone || '',
                businessAddress: vendor.address || '',
                city: vendor.city || '',
                country: vendor.country || 'Kenya',
                website: vendor.website || '',
                logoUrl: vendor.logo_url || '',
                bankName: vendor.bank_name || '',
                bankAccountNumber: vendor.bank_account_number || '',
                bankAccountName: vendor.bank_account_name || '',
                mpesaNumber: vendor.mpesa_number || '',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [supabase]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userProfile.fullName,
          phone: userProfile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: vendorProfile.businessName,
          description: vendorProfile.businessDescription,
          email: vendorProfile.businessEmail,
          phone: vendorProfile.businessPhone,
          address: vendorProfile.businessAddress,
          city: vendorProfile.city,
          country: vendorProfile.country,
          website: vendorProfile.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorProfile.id);

      if (error) throw error;

      toast.success('Business profile updated successfully');
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast.error('Failed to save business profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayments = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          bank_name: vendorProfile.bankName,
          bank_account_number: vendorProfile.bankAccountNumber,
          bank_account_name: vendorProfile.bankAccountName,
          mpesa_number: vendorProfile.mpesaNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorProfile.id);

      if (error) throw error;

      toast.success('Payment settings updated successfully');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, name: 'Profile', icon: User },
    { id: 'business' as TabType, name: 'Business', icon: Store },
    { id: 'payments' as TabType, name: 'Payments', icon: CreditCard },
    { id: 'notifications' as TabType, name: 'Notifications', icon: Bell },
    { id: 'security' as TabType, name: 'Security', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and business settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userProfile.fullName}
                    onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    placeholder="+254 700 000 000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  {vendorProfile.logoUrl ? (
                    <img
                      src={vendorProfile.logoUrl}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <Store className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={vendorProfile.businessName}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    value={vendorProfile.businessDescription}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, businessDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={vendorProfile.businessEmail}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, businessEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={vendorProfile.businessPhone}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, businessPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={vendorProfile.businessAddress}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, businessAddress: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={vendorProfile.city}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={vendorProfile.website}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, website: e.target.value })}
                    placeholder="https://"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveBusiness}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Ensure your payment details are accurate. Payouts will be sent to the account details provided below.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Number
                  </label>
                  <input
                    type="tel"
                    value={vendorProfile.mpesaNumber}
                    onChange={(e) => setVendorProfile({ ...vendorProfile, mpesaNumber: e.target.value })}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={vendorProfile.bankName}
                      onChange={(e) => setVendorProfile({ ...vendorProfile, bankName: e.target.value })}
                      placeholder="e.g., Equity Bank"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={vendorProfile.bankAccountNumber}
                      onChange={(e) => setVendorProfile({ ...vendorProfile, bankAccountNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={vendorProfile.bankAccountName}
                      onChange={(e) => setVendorProfile({ ...vendorProfile, bankAccountName: e.target.value })}
                      className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePayments}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <p className="text-gray-600">Configure how you receive notifications.</p>
              
              <div className="space-y-4">
                {[
                  { id: 'new_order', label: 'New Orders', description: 'Get notified when you receive a new order' },
                  { id: 'order_status', label: 'Order Status Updates', description: 'Updates when order status changes' },
                  { id: 'low_stock', label: 'Low Stock Alerts', description: 'When product stock falls below threshold' },
                  { id: 'payouts', label: 'Payout Notifications', description: 'When payouts are processed' },
                  { id: 'promotions', label: 'Promotions & Tips', description: 'Tips to grow your business' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-600 mb-4">Add an extra layer of security to your account.</p>
                <button className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                <p className="text-gray-600 mb-4">Permanently delete your vendor account and all associated data.</p>
                <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
