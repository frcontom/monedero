"use client";

import { Modal } from "@/components/ui/modal";
import { MovementForm } from "@/components/goals/movement-form";

export function QuickMovementModal({
  goalId,
  goalName,
  open,
  onClose,
}: {
  goalId: string;
  goalName: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`Registrar en "${goalName}"`}>
      <MovementForm goalId={goalId} />
    </Modal>
  );
}