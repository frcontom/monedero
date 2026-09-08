import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalModal } from "@/components/goals/goal-modal";

vi.mock("@/lib/client/hooks", () => ({
  useCreateGoal: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
  useUpdateGoal: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
  useCategories: () => ({
    data: { categories: [{ id: "1", name: "OTRO", color: "#64748b", icon: "📌" }] },
    isLoading: false,
  }),
}));

function renderModal() {
  return render(<GoalModal open onClose={() => {}} />);
}

describe("GoalModal (formulario dinámico)", () => {
  it("muestra fecha objetivo cuando la meta tiene fecha (default)", () => {
    renderModal();
    expect(screen.getByLabelText("Fecha objetivo")).toBeInTheDocument();
    expect(screen.getByLabelText("Periodicidad")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto por periodo ($)")).toBeInTheDocument();
  });

  it("oculta fecha objetivo al elegir 'Sin fecha'", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("radio", { name: "Sin fecha" }));
    expect(screen.queryByLabelText("Fecha objetivo")).not.toBeInTheDocument();
  });

  it("oculta campos periódicos al elegir 'Flexible'", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("radio", { name: "Flexible" }));
    expect(screen.queryByLabelText("Periodicidad")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Monto por periodo ($)")).not.toBeInTheDocument();
  });

  it("combina 'Sin fecha' + 'Flexible' sin campos dependientes", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("radio", { name: "Sin fecha" }));
    await user.click(screen.getByRole("radio", { name: "Flexible" }));
    expect(screen.queryByLabelText("Fecha objetivo")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Periodicidad")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Monto por periodo ($)")).not.toBeInTheDocument();
  });
});