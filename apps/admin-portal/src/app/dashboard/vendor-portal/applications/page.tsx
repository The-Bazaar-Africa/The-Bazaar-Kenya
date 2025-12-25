import PlaceholderPage from '@/components/PlaceholderPage';

export default function ApplicationsPage() {
  return (
    <PlaceholderPage
      title="Vendor Applications"
      description="Review and process new vendor applications"
      console="vendor-portal"
      features={[
        "View pending applications",
        "Review business documents",
        "Approve or reject applications",
        "Send feedback to applicants",
        "Track application history"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
