import PlaceholderPage from '@/components/PlaceholderPage';

export default function PayablesPage() {
  return (
    <PlaceholderPage
      title="Vendor Payables"
      description="Manage vendor payments and settlements"
      console="vendor-portal"
      features={[
        "View pending payouts",
        "Process vendor payments",
        "Track payment history",
        "Generate payout reports"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
