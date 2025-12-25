import PlaceholderPage from '@/components/PlaceholderPage';

export default function KYCPage() {
  return (
    <PlaceholderPage
      title="KYC Verification"
      description="Verify vendor identity and business documents"
      console="vendor-portal"
      features={[
        "Document verification queue",
        "ID and business license review",
        "Verification status tracking",
        "Compliance reporting"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
