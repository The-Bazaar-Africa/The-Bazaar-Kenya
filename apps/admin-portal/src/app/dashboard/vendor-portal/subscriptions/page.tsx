import PlaceholderPage from '@/components/PlaceholderPage';

export default function SubscriptionsPage() {
  return (
    <PlaceholderPage
      title="Vendor Subscriptions"
      description="Manage vendor subscription plans and billing"
      console="vendor-portal"
      features={[
        "View active subscriptions",
        "Manage subscription tiers",
        "Process upgrades/downgrades",
        "Billing and invoicing"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
