import PlaceholderPage from '@/components/PlaceholderPage';

export default function LogisticsPage() {
  return (
    <PlaceholderPage
      title="Logistics Overview"
      description="Track deliveries and logistics providers"
      console="service-providers"
      features={[
        "Delivery tracking",
        "Provider performance",
        "Shipping rate management",
        "Delivery analytics"
      ]}
      backHref="/dashboard/service-providers"
    />
  );
}
