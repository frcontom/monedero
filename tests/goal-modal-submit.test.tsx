import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalModal } from "@/components/goals/goal-modal";

const createMutate = vi.fn();

vi.mock("@/lib/client/hooks", () => ({
  useCreateGoal: () => ({ mutate: createMutate, isPending: false, isError: false, error: null }),
  useUpdateGoal: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
  useCategories: () => ({
    data: { categories: [{ id: "1", name: "OTRO", color: "#64748b", icon: "📌" }] },
    isLoading: false,
  }),
}));

describe("GoalModal submit", () => {
  it("envía payload coherente para meta flexible sin fecha", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<GoalModal open onClose={onClose} />);

    await user.type(screen.getByLabelText("Nombre de la meta"), "Meta flexible");
    await user.type(screen.getByLabelText("Monto objetivo ($)"), "2000000");
    await user.click(screen.getByRole("radio", { name: "Sin fecha" }));
    await user.click(screen.getByRole("radio", { name: "Flexible" }));
    await user.click(screen.getByRole("button", { name: "Crear meta" }));

    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));

    const [payload, options] = createMutate.mock.calls[0];
    expect(payload).toMatchObject({
      name: "Meta flexible",
      targetAmount: 2000000,
      dateMode: "NO_DATE",
      targetDate: null,
      planningMode: "FLEXIBLE",
      periodicity: null,
      plannedAmount: null,
    });

    options.onSuccess();
    expect(onClose).toHaveBeenCalled();
  });

  it("envía payload coherente para meta periódica con fecha", async () => {
    const user = userEvent.setup();
    render(<GoalModal open onClose={() => {}} />);

    await user.type(screen.getByLabelText("Nombre de la meta"), "PC gamer");
    await user.type(screen.getByLabelText("Monto objetivo ($)"), "5000000");
    await user.type(screen.getByLabelText("Fecha objetivo"), "2026-12-31");
    await user.type(screen.getByLabelText("Monto por periodo ($)"), "1500000");
    await user.selectOptions(screen.getByLabelText("Periodicidad"), "MONTHLY");
    await user.click(screen.getByRole("button", { name: "Crear meta" }));

    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));
    const [payload] = createMutate.mock.calls[0];
    expect(payload).toMatchObject({
      dateMode: "TARGET_DATE",
      targetDate: "2026-12-31",
      planningMode: "PERIODIC",
      periodicity: "MONTHLY",
      plannedAmount: 1500000,
    });
  });
});