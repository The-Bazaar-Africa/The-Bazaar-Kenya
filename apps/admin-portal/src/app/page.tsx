import { redirect } from 'next/navigation';

export default function AdminHome() {
  // Redirect to dashboard - admins should land on dashboard
  redirect('/dashboard');
}

