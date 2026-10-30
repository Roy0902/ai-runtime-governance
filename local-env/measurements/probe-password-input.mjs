import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.route("**/*", (route) => route.abort());
  await page.setContent(
    '<label>Password probe<input id="password-probe" type="password"></label>' +
      '<label>Text probe<textarea id="text-probe"></textarea></label>',
  );
  const observations = await page.evaluate(() => {
    const samples = {
      ordinary: "Probe Text",
      nul: "a\u0000b",
      lf: "a\nb",
      cr: "a\rb",
      crlf: "a\r\nb",
    };
    return Object.entries(samples).map(([kind, value]) => {
      const password = document.getElementById("password-probe");
      const textarea = document.getElementById("text-probe");
      password.value = value;
      textarea.value = value;
      return {
        kind,
        suppliedCodePoints: [...value].length,
        passwordCodePoints: [...password.value].length,
        passwordPreservedExactText: password.value === value,
        textareaCodePoints: [...textarea.value].length,
        textareaPreservedExactText: textarea.value === value,
      };
    });
  });
  const report = {
    recordedAtUtc: new Date().toISOString(),
    browser: `Chromium ${browser.version()}`,
    purpose: "Platform input feasibility only, not an application test or oracle",
    usesRealCredentials: false,
    networkRequestsPermitted: false,
    observations,
  };
  const evidence = new URL(
    "../../spec-to-test-workflow/phase-1/native-auth/evidence/",
    import.meta.url,
  );
  await mkdir(evidence, { recursive: true });
  const output = new URL("password-input-feasibility.json", evidence);
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Recorded platform feasibility: ${fileURLToPath(output)}`);
  console.table(observations);
} finally {
  await browser.close();
}
