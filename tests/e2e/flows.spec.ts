import { test, expect } from "@playwright/test";

test("login con credenciales correctas lleva al dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.SEED_USER_EMAIL!);
  await page.fill('input[name="password"]', process.env.SEED_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("sin sesión se redirige a login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});

test("flujo completo: crear meta y registrar aporte", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', process.env.SEED_USER_EMAIL!);
  await page.fill('input[name="password"]', process.env.SEED_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/metas");
  await page.getByRole("button", { name: "+ Nueva meta" }).click();

  const name = `Meta E2E ${Date.now()}`;
  await page.getByLabel("Nombre de la meta").fill(name);
  await page.getByLabel("Monto objetivo ($)").fill("2000000");
  await page.getByRole("radio", { name: "Sin fecha" }).check();
  await page.getByRole("radio", { name: "Flexible" }).check();
  await page.getByRole("button", { name: "Crear meta" }).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("link", { name: new RegExp(name) }).click();
  await expect(page.getByRole("button", { name: "Registrar aporte" })).toBeVisible();

  await page.getByLabel("Monto ($)").fill("500000");
  await page.getByRole("button", { name: "Registrar aporte" }).click();
  await expect(page.getByText("+ $ 500.000").first()).toBeVisible();

  // limpieza: cancelar la meta creada por el test
  const goalId = page.url().split("/").pop()!;
  await page.evaluate(async (id) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  }, goalId);
});