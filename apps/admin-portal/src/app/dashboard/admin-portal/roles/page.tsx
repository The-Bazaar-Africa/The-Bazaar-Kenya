import PlaceholderPage from '@/components/PlaceholderPage';

export default function RolesPage() {
  return (
    <PlaceholderPage
      title="Roles & Permissions"
      description="Configure access controls and permissions"
      console="admin-portal"
      features={[
        "Create and edit roles",
        "Assign permissions to roles",
        "View role assignments",
        "Audit permission changes"
      ]}
      backHref="/dashboard/admin-portal"
    />
  );
}
