import PlaceholderPage from '@/components/PlaceholderPage';

export default function ReviewsPage() {
  return (
    <PlaceholderPage
      title="Reviews & Ratings"
      description="Moderate customer reviews and ratings"
      console="main-app"
      features={[
        "View all product reviews",
        "Moderate inappropriate content",
        "Respond to customer feedback",
        "Review analytics and trends"
      ]}
      backHref="/dashboard/main-app"
    />
  );
}
