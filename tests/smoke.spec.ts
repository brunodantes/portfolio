import { expect, test } from "@playwright/test";

test.describe("página", () => {
  test.beforeEach(async ({ page }) => {
    // Começa em PT, mas sem sobrescrever o que o próprio teste escolher (o reload precisa ler a escolha).
    await page.addInitScript(() => {
      if (!localStorage.getItem("pf:prefs")) localStorage.setItem("pf:prefs", JSON.stringify({ locale: "pt", motion: true }));
    });
  });

  test("abre com o briefing, os 7 capítulos e sem erros no console", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto("/");
    await expect(page).toHaveTitle(/Bruno Almeida/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Construo sistemas que não param.");
    await expect(page.locator("[data-chapter]")).toHaveCount(7);
    await expect(page.locator("#job-3")).toContainText("Itaú Unibanco");
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test("troca o idioma para inglês e lembra a escolha", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "en", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("I build systems that stay up.");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("I build systems that stay up.");
  });

  test("'Ver tudo' mostra todos os objetivos da operação", async ({ page }) => {
    await page.goto("/");
    const btg = page.locator("#job-2");
    await btg.scrollIntoViewIfNeeded();
    await expect(btg.getByRole("listitem").filter({ hasText: "Necton Portal" }).first()).toBeVisible();
    await btg.getByRole("button", { name: /Ver tudo \(9\)/ }).click();
    await expect(btg.getByText("advisory", { exact: false }).first()).toBeVisible();
  });

  test("contato aponta para LinkedIn, GitHub, telefone e currículo", async ({ page, request }) => {
    await page.goto("/");
    const contact = page.locator("#contato");
    await expect(contact.getByRole("link", { name: /Conversar no LinkedIn/ })).toHaveAttribute("href", "https://linkedin.com/in/bdalme");
    await expect(contact.getByRole("link", { name: /github\.com\/brunodantes/ })).toHaveAttribute("href", "https://github.com/brunodantes");
    await expect(contact.getByRole("link", { name: /\+55/ })).toHaveAttribute("href", /^tel:\+55/);
    const resume = await request.get("/resume/Bruno_Almeida_Resume_PTBR.pdf");
    expect(resume.status()).toBe(200);
  });
});

test("404 mostra a página no tema", async ({ page }) => {
  const response = await page.goto("/rota-que-nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /Voltar para o início|Back to home/ })).toBeVisible();
});

test("SEO: imagem de compartilhamento, JSON-LD e sitemap", async ({ page, request }) => {
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
  await page.goto("/");
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(ld["@type"]).toBe("Person");
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
});
