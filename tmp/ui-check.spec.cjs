const path = require("node:path");
const { test, expect } = require("@playwright/test");

test.use({
  viewport: { width: 1440, height: 1000 },
  launchOptions: {
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  }
});

test("arena test, submit, sample editing, and focus guard flow", async ({ page }) => {
  const consoleMessages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    consoleMessages.push(`pageerror: ${error.message}`);
  });

  await page.goto("http://localhost:8093", { waitUntil: "load" });
  await expect(page.locator("body")).not.toContainText(new RegExp("Lee" + "tCode", "i"));
  await expect(page.locator(".problem-link")).toHaveCount(50);
  await expect(page.locator(".sample-item")).toHaveCount(2);
  await expect(page.locator(".sample-panel")).toContainText("Sample Testcase");
  await expect(page.getByTestId("run-tests")).toBeDisabled();
  await expect(page.getByTestId("submit-code")).toBeDisabled();
  await expect(page.locator(".sample-input").first()).toBeDisabled();
  await expect(page.locator(".sample-output").first()).toBeDisabled();
  await page.getByRole("button", { name: "使用教學" }).click();
  await expect(page.locator(".tutorial-page")).toContainText("使用教學");
  await expect(page.locator(".answer-card")).toHaveCount(5);
  await expect(page.locator(".tutorial-code").first()).toContainText("def normalize_scores");
  await page.getByRole("button", { name: "題庫" }).click();

  const unique = Date.now();
  await page.getByTestId("auth-mode-toggle").click();
  await page.getByTestId("auth-name").fill("PW Student");
  await page.getByTestId("auth-student-id").fill(`PW${unique}`);
  await page.getByTestId("auth-email").fill(`pw${unique}@example.com`);
  await page.getByTestId("auth-password").fill("Student123");
  await page.getByTestId("auth-submit").click();
  await expect(page.locator(".user-chip")).toContainText("PW Student");
  await expect(page.getByTestId("start-attempt")).toBeEnabled();

  await page.getByTestId("start-attempt").click();
  await expect(page.getByTestId("run-tests")).toBeEnabled();
  await expect(page.getByTestId("submit-code")).toBeEnabled();
  await expect(page.locator(".sample-input").first()).toBeEnabled();
  await expect(page.locator(".sample-output").first()).toBeEnabled();
  await expect(page.locator(".attempt-controls")).toContainText("Submit 0/3");
  await expect(page.locator(".nav-link").nth(1)).toBeDisabled();
  await expect(page.locator(".problem-link").nth(1)).toBeDisabled();
  await expect(page.getByRole("button", { name: "登出" })).toBeDisabled();

  const editor = page.getByTestId("code-editor");
  await expect(page.locator(".code-highlight .code-keyword").filter({ hasText: "def" }).first()).toBeVisible();
  await expect(page.locator(".code-highlight .code-comment").first()).toBeVisible();
  await editor.fill("def normalize_scores(records):\n");
  await editor.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Tab");
  await expect(editor).toHaveValue(/ {4}$/);

  const paste = await editor.evaluate((element) => {
    const before = element.value;
    const data = new DataTransfer();
    data.setData("text/plain", "PASTE_BLOCK_TEST");
    const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data });
    const allowed = element.dispatchEvent(event);
    return { before, after: element.value, blocked: !allowed };
  });
  expect(paste.after).toBe(paste.before);
  expect(paste.blocked).toBe(true);

  await triggerFocusWarning(page, "1/2");
  await triggerFocusWarning(page, "2/2");

  await page.locator(".sample-input").first().fill("[[{\"name\":\"Custom\",\"score\":\"9\"}]]");
  await page.locator(".sample-output").first().fill("[{\"name\":\"Custom\",\"normalized\":100}]");
  await editor.fill("def normalize_scores(records):\n    return [{\"name\": \"Custom\", \"normalized\": 100}]\n");
  await expect(page.locator(".code-highlight .code-keyword").filter({ hasText: "return" }).first()).toBeVisible();
  await expect(page.locator(".code-highlight .code-string").filter({ hasText: "\"Custom\"" }).first()).toBeVisible();
  await expect(page.locator(".code-highlight .code-number").filter({ hasText: "100" }).first()).toBeVisible();
  await page.getByTestId("run-tests").click();
  await expect(page.locator(".result-header")).toContainText("1/2");
  await expect(page.locator(".case-debug").first()).toContainText("Expected");
  await expect(page.locator(".case-debug").first()).toContainText("Actual");
  await expect(page.locator(".attempt-controls")).toContainText("Submit 0/3");

  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator(".warning-modal")).toContainText("強制送出");
  await expect(page.locator(".result-header")).toContainText("0/4");
  await page.getByTestId("focus-warning-close").click();
  await expect(page.locator(".attempt-controls")).toContainText("Submit 1/3");
  await expect(page.locator(".nav-link").nth(1)).toBeEnabled();
  await expect(page.locator(".problem-link").nth(1)).toBeEnabled();

  for (let attempt = 2; attempt <= 3; attempt += 1) {
    await expect(page.getByTestId("start-attempt")).toBeEnabled();
    await page.getByTestId("start-attempt").click();
    await expect(page.getByTestId("submit-code")).toBeEnabled();
    await editor.fill("def normalize_scores(records):\n    return []\n");
    await page.getByTestId("submit-code").click();
    await expect(page.locator(".result-header")).toContainText("0/4");
    await expect(page.locator(".attempt-controls")).toContainText(`Submit ${attempt}/3`);
  }

  await page.getByRole("button", { name: "總排行榜" }).click();
  await expect(page.locator(".leaderboard-heading")).toContainText("全站");
  await page.getByTestId("leaderboard-rules").click();
  await expect(page.locator(".ranking-rules")).toContainText("平均題目排名");
  await expect(page.locator(".global-ranking tbody tr").first()).toBeVisible();
  await page.getByRole("button", { name: "題庫" }).click();

  await expect(page.getByTestId("start-attempt")).toBeEnabled();
  await page.getByTestId("start-attempt").click();
  await expect(page.getByTestId("run-tests")).toBeEnabled();
  await expect(page.getByTestId("submit-code")).toBeDisabled();
  await expect(page.locator(".attempt-controls")).toContainText("Submit 3/3");
  await expect(page.locator(".nav-link").nth(1)).toBeDisabled();
  await expect(page.locator(".problem-link").nth(1)).toBeDisabled();

  await page.screenshot({ path: path.join(process.cwd(), "tmp", "dataarena-arena-flow.png"), fullPage: true });
  expect(consoleMessages).toEqual([]);
});

async function triggerFocusWarning(page, expectedCountText) {
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator(".warning-modal")).toContainText(expectedCountText);
  await page.getByTestId("focus-warning-close").click();
  await page.waitForTimeout(1250);
}
