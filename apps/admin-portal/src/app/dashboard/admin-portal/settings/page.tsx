import PlaceholderPage from '@/components/PlaceholderPage';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure platform-wide settings"
      console="admin-portal"
      features={[
        "General platform settings",
        "Email and notification config",
        "Security settings",
        "API configuration"
      ]}
      backHref="/dashboard/admin-portal"
    />
  );
}
