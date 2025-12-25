import { redirect } from 'next/navigation';

export default function VendorHome() {
  // Redirect to dashboard - vendors should land on dashboard
  redirect('/dashboard');
}

