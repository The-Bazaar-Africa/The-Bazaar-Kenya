import PlaceholderPage from '@/components/PlaceholderPage';

export default function PromotionsPage() {
  return (
    <PlaceholderPage
      title="Promotions & Ads"
      description="Manage vendor promotions and advertising"
      console="vendor-portal"
      features={[
        "Review ad submissions",
        "Approve promotional campaigns",
        "Track ad performance",
        "Manage ad placements"
      ]}
      backHref="/dashboard/vendor-portal"
    />
  );
}
