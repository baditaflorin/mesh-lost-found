import { expect, test, type Page } from "@playwright/test";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";

async function closeInitiallyOpenSettings(page: Page): Promise<void> {
  const settings = page.getByRole("dialog", { name: "Settings" });
  if (!(await settings.isVisible().catch(() => false))) return;

  const close = settings.getByRole("button", { name: "close" });
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  } else {
    await page.keyboard.press("Escape");
  }
  await expect(settings).toBeHidden();
}

test("a listing posted by one peer appears in the shared room", async ({ browser, baseURL }) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", {
    storagePrefix: "mesh-lost-found",
  });

  try {
    await Promise.all([closeInitiallyOpenSettings(a), closeInitiallyOpenSettings(b)]);

    await a.getByLabel("Display name").fill("Ari");
    await a.getByLabel("Listing kind").selectOption("found");
    await a.getByLabel("Item title").fill("Blue umbrella");
    await a.getByLabel("Item details").fill("Left by the east entrance");
    await a.getByRole("button", { name: "Post to this room" }).click();

    await expect(b.getByText(/Blue umbrella/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(b.getByText("Left by the east entrance", { exact: true })).toBeVisible();
    await expect(b.getByText("Posted by Ari", { exact: true })).toBeVisible();
  } finally {
    await cleanup();
  }
});
