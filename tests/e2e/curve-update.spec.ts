import { test, expect } from "@playwright/test";

const norm = (s: string | null) => (s ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

test("agregar y eliminar movimiento actualiza sin F5", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.SEED_USER_EMAIL!);
  await page.fill('input[name="password"]', process.env.SEED_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  const goalId = await page.evaluate(async () => {
    const g = await (
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Curva update",
          targetAmount: 2000000,
          startDate: "2026-09-01",
          dateMode: "NO_DATE",
          planningMode: "FLEXIBLE",
          category: "OTRO",
        }),
      })
    ).json();
    for (const m of [
      { date: "2026-09-04", type: "deposit", amount: 22222 },
      { date: "2026-09-05", type: "deposit", amount: 230000 },
      { date: "2026-09-06", type: "deposit", amount: 350000 },
    ]) {
      await fetch(`/api/goals/${g.goal.id}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m),
      });
    }
    return g.goal.id;
  });

  await page.goto(`/metas/${goalId}`);
  await page.getByText("Curva de progreso").waitFor();
  await page.waitForTimeout(1500);

  const acum = async () => norm(await page.locator("div", { hasText: "Acumulado" }).last().locator("p.font-semibold").textContent());

  expect(await acum()).toContain("602.222");

  await page.getByLabel("Monto ($)").fill("500000");
  await page.getByRole("button", { name: "Registrar aporte" }).click();
  await page.waitForTimeout(1200);
  expect(await acum()).toContain("1.102.222");

  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Eliminar movimiento" }).first().click();
  await page.waitForTimeout(1500);
  expect(await acum()).toContain("752.222");

  await page.evaluate(async (id) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  }, goalId);
});