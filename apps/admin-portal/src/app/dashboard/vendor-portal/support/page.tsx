import PlaceholderPage from '@/components/PlaceholderPage';

export default function SupportPage() {
  return (
    <PlaceholderPage
      title="Vendor Support"
      description="Manage vendor support tickets and escalations"
      console="vendor-portal"
      features={[
        "Support ticket queue",
        "Live chat management",
        "Escalation handling",
        "Support analytics"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
