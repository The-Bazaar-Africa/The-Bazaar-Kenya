import PlaceholderPage from '@/components/PlaceholderPage';

export default function CommissionsPage() {
  return (
    <PlaceholderPage
      title="Commissions & Payouts"
      description="Manage service provider commissions"
      console="service-providers"
      features={[
        "Commission calculations",
        "Payout processing",
        "Commission reports",
        "Rate configuration"
      ]}
      backHref="/dashboard/service-providers"
    />
  );
}
