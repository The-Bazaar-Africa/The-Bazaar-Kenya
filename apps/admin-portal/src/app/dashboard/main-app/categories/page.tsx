import PlaceholderPage from '@/components/PlaceholderPage';

export default function CategoriesPage() {
  return (
    <PlaceholderPage
      title="Category Management"
      description="Organize products with categories and subcategories"
      console="main-app"
      features={[
        "Create and edit categories",
        "Manage category hierarchy",
        "Set category attributes",
        "Assign products to categories"
      ]}
      backHref="/dashboard/main-app"
    />
  );
}
