"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type { GoalSummary } from "@/lib/types";

export const qk = {
  goals: ["goals"],
  goal: (id: string) => ["goals", id],
  movements: (id: string) => ["goals", id, "movements"],
  projection: (id: string) => ["goals", id, "projection"],
  analytics: (id: string) => ["goals", id, "analytics"],
  dashboard: ["dashboard"],
  categories: ["categories"],
};

export function useGoals() {
  return useQuery({ queryKey: qk.goals, queryFn: () => api.listGoals() });
}

export function useGoal(id: string) {
  return useQuery({ queryKey: qk.goal(id), queryFn: () => api.getGoal(id), enabled: !!id });
}

export function useDashboard() {
  return useQuery({ queryKey: qk.dashboard, queryFn: () => api.dashboard() });
}

export function useJournal(month: string) {
  return useQuery({ queryKey: ["journal", month], queryFn: () => api.journal(month) });
}

export function useJournalHeatmap(weeks = 16) {
  return useQuery({ queryKey: ["journal", "heatmap", weeks], queryFn: () => api.journalHeatmap(weeks) });
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => api.categories() });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateCategory>[1] }) =>
      api.updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories });
      invalidateAll(qc);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories });
      invalidateAll(qc);
    },
  });
}

export function useMovements(goalId: string) {
  return useQuery({
    queryKey: qk.movements(goalId),
    queryFn: () => api.listMovements(goalId),
    enabled: !!goalId,
  });
}

export function useProjection(goalId: string) {
  return useQuery({
    queryKey: qk.projection(goalId),
    queryFn: () => api.projection(goalId),
    enabled: !!goalId,
  });
}

export function useAnalytics(goalId: string) {
  return useQuery({
    queryKey: qk.analytics(goalId),
    queryFn: () => api.analytics(goalId),
    enabled: !!goalId,
  });
}

export function useCategoryAnalytics() {
  return useQuery({ queryKey: ["analytics", "categories"], queryFn: () => api.categoryAnalytics() });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: qk.goals });
  queryClient.invalidateQueries({ queryKey: qk.dashboard });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateGoal>[1] }) =>
      api.updateGoal(id, data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GoalSummary["status"] }) =>
      api.setStatus(id, status),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAddMovement(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.addMovement>[1]) => api.addMovement(goalId, data),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: qk.movements(goalId) });
      qc.invalidateQueries({ queryKey: qk.projection(goalId) });
      qc.invalidateQueries({ queryKey: qk.analytics(goalId) });
      qc.invalidateQueries({ queryKey: qk.goal(goalId) });
    },
  });
}

export function useUpdateMovement(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      movementId,
      data,
    }: {
      movementId: string;
      data: Parameters<typeof api.updateMovement>[2];
    }) => api.updateMovement(goalId, movementId, data),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: qk.movements(goalId) });
      qc.invalidateQueries({ queryKey: qk.projection(goalId) });
      qc.invalidateQueries({ queryKey: qk.analytics(goalId) });
      qc.invalidateQueries({ queryKey: qk.goal(goalId) });
    },
  });
}

export function useDeleteMovement(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (movementId: string) => api.deleteMovement(goalId, movementId),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: qk.movements(goalId) });
      qc.invalidateQueries({ queryKey: qk.projection(goalId) });
      qc.invalidateQueries({ queryKey: qk.analytics(goalId) });
      qc.invalidateQueries({ queryKey: qk.goal(goalId) });
    },
  });
}