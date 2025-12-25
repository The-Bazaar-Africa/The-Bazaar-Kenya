import PlaceholderPage from '@/components/PlaceholderPage';

export default function TasksPage() {
  return (
    <PlaceholderPage
      title="Task Management"
      description="Assign and track staff tasks"
      console="admin-portal"
      features={[
        "Create and assign tasks",
        "Track task progress",
        "Set deadlines and priorities",
        "Task completion reports"
      ]}
      backHref="/dashboard/admin-portal"
    />
  );
}
