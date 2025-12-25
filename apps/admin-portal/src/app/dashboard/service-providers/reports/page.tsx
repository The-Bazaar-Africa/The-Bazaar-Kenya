import PlaceholderPage from '@/components/PlaceholderPage';

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="Provider Reports"
      description="Generate service provider analytics"
      console="service-providers"
      features={[
        "Performance reports",
        "Transaction summaries",
        "Custom report builder",
        "Export to CSV/PDF"
      ]}
      backHref="/dashboard/service-providers"
    />
  );
}
