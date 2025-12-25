import PlaceholderPage from '@/components/PlaceholderPage';

export default function IntegrationsPage() {
  return (
    <PlaceholderPage
      title="Service Integrations"
      description="Manage third-party service connections"
      console="service-providers"
      features={[
        "View active integrations",
        "Configure API connections",
        "Test integration health",
        "Manage API keys"
      ]}
      backHref="/dashboard/service-providers"
    />
  );
}
