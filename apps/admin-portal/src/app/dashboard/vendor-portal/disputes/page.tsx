import PlaceholderPage from '@/components/PlaceholderPage';

export default function DisputesPage() {
  return (
    <PlaceholderPage
      title="Dispute Center"
      description="Handle vendor and customer disputes"
      console="vendor-portal"
      features={[
        "View open disputes",
        "Mediate between parties",
        "Process refunds",
        "Track resolution history"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
