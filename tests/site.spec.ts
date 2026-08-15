import { expect, test, type Route } from "@playwright/test";

const emptyRepos = [
  {
    name: "public-terminal",
    html_url: "https://github.com/ks1686/public-terminal",
    description: "Trading TUI",
    language: "Go",
    stargazers_count: 1,
    forks_count: 0,
    updated_at: "2026-08-01T00:00:00Z",
    topics: ["go"],
  },
];

async function mockGitHub(route: Route) {
  const url = route.request().url();
  if (url.includes("/readme")) {
    throw new Error(`unexpected GitHub README request: ${url}`);
  }
  if (url.includes("/repos?")) {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(emptyRepos),
    });
    return;
  }
  if (url.includes("/events/public")) {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
    return;
  }
  await route.fulfill({ status: 404, body: "unmocked GitHub request" });
}

test.beforeEach(async ({ page }) => {
  await page.route("https://api.github.com/**", mockGitHub);
});

test("serves brand assets and résumé", async ({ request }) => {
  for (const path of ["/favicon.ico", "/apple-touch-icon.png", "/og-image.jpg", "/Resume_Karim_Smires_2026.pdf"]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBeTruthy();
  }

  const retired = await request.get("/Resume_Karim_Smires_2025.pdf");
  expect(retired.status()).toBe(404);
});

test("desktop page has skip link, nav, and no README fan-out", async ({ page }) => {
  const readmeHits: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/readme")) readmeHits.push(req.url());
  });

  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/");

  await expect(page).toHaveTitle("Karim Smires");
  await expect(page.locator(".skip-link")).toHaveAttribute("href", "#top");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Education" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  await expect(page.getByRole("link", { name: "public-terminal" })).toBeVisible();
  await expect(page.locator("#github-activity-summary")).toContainText("0 active days");
  expect(readmeHits).toEqual([]);
});

test("mobile menu opens section links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Menu" });
  const education = page.getByRole("link", { name: "Education" });

  await expect(toggle).toBeVisible();
  await expect(education).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(education).toBeVisible();

  await education.click();
  await expect(page).toHaveURL(/#education$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
