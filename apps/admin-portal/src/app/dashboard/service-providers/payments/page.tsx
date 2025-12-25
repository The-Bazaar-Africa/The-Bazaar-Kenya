import PlaceholderPage from '@/components/PlaceholderPage';

export default function PaymentsPage() {
  return (
    <PlaceholderPage
      title="Payment Transactions"
      description="View all payment gateway transactions"
      console="service-providers"
      features={[
        "Transaction history",
        "Payment status tracking",
        "Refund processing",
        "Settlement reports"
      ]}
      backHref="/dashboard/service-providers"
    />
  );
}
