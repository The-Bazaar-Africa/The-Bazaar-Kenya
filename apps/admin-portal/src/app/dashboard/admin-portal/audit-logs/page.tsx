import PlaceholderPage from '@/components/PlaceholderPage';

export default function AuditLogsPage() {
  return (
    <PlaceholderPage
      title="Audit Logs"
      description="View all system activity and changes"
      console="admin-portal"
      features={[
        "Complete activity history",
        "Filter by user, action, or date",
        "Export audit reports",
        "Security event tracking"
      ]}
      backHref="/dashboard/admin-portal"
    />
  );
}
