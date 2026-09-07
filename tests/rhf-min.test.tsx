import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(1),
    amount: z.number().int().positive(),
    mode: z.enum(["TARGET_DATE", "NO_DATE"]),
    targetDate: z.union([z.string(), z.literal("")]).optional().nullable(),
    plannedAmount: z.number().int().positive().optional().nullable(),
  });

const superSchema = schema.superRefine((data, ctx) => {
  if (data.mode === "TARGET_DATE" && !data.targetDate) {
    ctx.addIssue({ code: "custom", path: ["targetDate"], message: "obligatoria" });
  }
  if (data.mode === "NO_DATE" && data.plannedAmount) {
    ctx.addIssue({ code: "custom", path: ["plannedAmount"], message: "no aplica" });
  }
});

function MinimalForm({ schema: s, onSubmit }: { schema: typeof schema; onSubmit: (v: unknown) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; amount: number; mode: "TARGET_DATE" | "NO_DATE"; targetDate?: string | null; plannedAmount?: number | null }>({
    resolver: zodResolver(s),
    defaultValues: { name: "", amount: Number.NaN, mode: "NO_DATE", targetDate: "", plannedAmount: null },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Nombre</label>
      <input id="name" {...register("name")} />
      {errors.name && <p data-testid="err-name">{errors.name.message}</p>}
      <label htmlFor="amount">Monto</label>
      <input id="amount" type="number" {...register("amount", { setValueAs: (v) => (v === "" ? Number.NaN : Number(v)) })} />
      {errors.amount && <p data-testid="err-amount">{errors.amount.message}</p>}
      <button type="submit">Guardar</button>
    </form>
  );
}

describe("minimal RHF + zod v4", () => {
  it("submite con schema simple (sin superRefine)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MinimalForm schema={schema} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nombre"), "Meta");
    await user.type(screen.getByLabelText("Monto"), "2000000");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("submite con superRefine sin issues", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MinimalForm schema={superSchema} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nombre"), "Meta");
    await user.type(screen.getByLabelText("Monto"), "2000000");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("muestra error si el monto es NaN", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MinimalForm schema={superSchema} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nombre"), "Meta");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(screen.getByTestId("err-amount")).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});