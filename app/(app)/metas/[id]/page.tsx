import { GoalDetailView } from "@/components/goals/goal-detail-view";

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GoalDetailView goalId={id} />;
}