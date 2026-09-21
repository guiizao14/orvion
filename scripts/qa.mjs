import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch();
await mkdir("qa", { recursive: true });
const report = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
    [375, 812],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [],
      failed = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${base}/landing/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1900);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `overflow ${width}`,
    );
    const cta = await page.locator(".hero-actions .primary").boundingBox();
    assert.ok(cta.y + cta.height < height, `CTA below fold ${width}`);
    const links = await page
      .locator('a[href^="https://wa.me/"]')
      .evaluateAll((es) => es.map((e) => e.href));
    assert.ok(links.length >= 7);
    assert.ok(links.every((h) => new URL(h).pathname === "/5527999408858"));
    assert.ok(decodeURIComponent(links[1]).includes("Olá!"));
    assert.equal(
      await page
        .locator("img")
        .evaluateAll(
          (es) =>
            es.filter(
              (e) => e.loading !== "lazy" && (!e.complete || !e.naturalWidth),
            ).length,
        ),
      0,
    );
    await page.screenshot({ path: `qa/hero-${width}.png` });
    if (width <= 900) {
      await page.locator(".menu-toggle").click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "true",
      );
      assert.ok(await page.locator("#navigation").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
      await page.locator(".menu-toggle").click();
      await page.locator('#navigation a[href="#analise"]').click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
    }
    const summary = page.locator(".analysis-item summary").nth(1);
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);
    assert.equal(await page.locator(".analysis-item[open]").count(), 1);
    assert.equal(await summary.getAttribute("aria-expanded"), "true");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(800);
    const opacity = await page
      .locator(".analysis-item")
      .nth(0)
      .evaluate((e) => getComputedStyle(e).opacity);
    assert.equal(opacity, "0.8");
    await page.keyboard.press("Space");
    await page.waitForTimeout(1000);
    assert.equal(await page.locator(".analysis-item[open]").count(), 0);
    assert.equal(
      await page
        .locator(".analysis-options")
        .evaluate((e) => e.classList.contains("has-selection")),
      false,
    );
    assert.equal(
      await page
        .locator(".analysis-item")
        .nth(0)
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    await summary.click();
    await page.locator("#contato").scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
    assert.ok(
      await page
        .locator(".site-header")
        .evaluate((e) => e.classList.contains("scrolled")),
    );
    await page.locator("#presenca").scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
    assert.equal(
      await page
        .locator("#presenca .section-intro")
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    await page.locator(".hero-actions .primary").hover();
    await page.locator(".hero-actions .primary").focus();
    assert.equal(
      await page
        .locator(".hero-actions .primary")
        .evaluate((e) => getComputedStyle(e).outlineStyle),
      "solid",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".flow path")
        .first()
        .evaluate((e) => getComputedStyle(e).animationName),
      "none",
    );
    assert.equal(await page.locator(".waiting").count(), 0);
    const a11y = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      a11y.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
      `axe ${width}`,
    );
    await page.screenshot({ path: `qa/full-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    report.push({
      viewport: `${width}x${height}`,
      overflow: false,
      ctaAboveFold: true,
      menu: width <= 900 ? "passed" : "desktop navigation",
      accordionKeyboard: "passed",
      reverseScroll: "passed",
      reducedMotion: "passed",
      axeViolations: 0,
      consoleErrors: 0,
      httpErrors: 0,
    });
    console.log(`PASS landing ${width}x${height}`);
    await context.close();
  }
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`${base}/landing/`);
  assert.ok(await page.locator("h1").isVisible());
  await page.locator(".analysis-item summary").nth(2).click();
  assert.ok(
    (await page.locator(".analysis-item").nth(2).getAttribute("open")) !== null,
  );
  assert.ok(
    (
      await page.locator(".hero-actions .primary").getAttribute("href")
    ).includes("5527999408858"),
  );
  report.push({
    javascriptDisabled: "content, native accordion and WhatsApp passed",
  });
  await context.close();
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: "networkidle" });
    assert.ok(
      await page.getByText("Dashboard de Leads", { exact: true }).isVisible(),
    );
    const name = await page.locator("h3").first().textContent();
    await page.locator("h3").first().click();
    assert.ok((await page.locator("h2").textContent()).includes(name));
    await page
      .getByPlaceholder("Buscar lead por nome...")
      .fill("nome-inexistente-qa");
    assert.ok(await page.getByText("Nenhum lead encontrado.").isVisible());
    await page.getByPlaceholder("Buscar lead por nome...").fill("");
    await page
      .getByRole("button", { name: "PEGAR LEAD", exact: true })
      .first()
      .click();
    assert.ok(
      await page
        .getByRole("button", { name: "Lead já pego", exact: true })
        .first()
        .isDisabled(),
    );
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `qa/dashboard-${width}.png` });
    report.push({
      dashboard: width,
      selection: "passed",
      search: "passed",
      grabLead: "passed",
      mode: "demo; live credentials not configured",
    });
    console.log(`PASS dashboard ${width}`);
    await context.close();
  }
  const brandContext = await browser.newContext({
    viewport: { width: 1000, height: 600 },
  });
  const brandPage = await brandContext.newPage();
  await brandPage.goto(base + "/landing/");
  await brandPage.setContent(
    `<body style="margin:0;font-family:Arial"><div style="background:#080B12;padding:55px;display:flex;gap:90px;align-items:center"><img src="${base}/brand/logo-light.svg" width="580"><img src="${base}/brand/symbol-light.svg" width="100"></div><div style="background:#f4f6f8;padding:55px;display:flex;gap:90px;align-items:center"><img src="${base}/brand/logo-dark.svg" width="580"><img src="${base}/brand/symbol-dark.svg" width="100"></div><div style="background:#0d1422;padding:50px;display:flex;gap:90px;align-items:center"><img src="${base}/brand/logo-mono.svg" width="580"><img src="${base}/brand/favicon.svg" width="48"></div></body>`,
  );
  await brandPage
    .locator("img")
    .evaluateAll((es) => Promise.all(es.map((e) => e.decode())));
  await brandPage.screenshot({ path: "qa/brand-variants.png" });
  await brandContext.close();
  await writeFile("qa/results.json", JSON.stringify(report, null, 2));
  console.log("All checks passed; screenshots and results saved in qa/.");
} finally {
  await browser.close();
}
