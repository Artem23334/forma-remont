"""
Opcjonalny test przeglądarkowy (Playwright dla Pythona).
Wymaga działającego serwera:  npm run dev  (domyślnie http://localhost:3000)

    pip install playwright && playwright install chromium
    python tests/e2e/layout_check.py [--base http://localhost:3000] [--shots out_dir] [--offline-images]

Sprawdza dla szerokości 360/390/768/1024/1440/1920:
  - brak poziomego przewijania i elementów wychodzących poza ekran,
  - działanie nawigacji (kotwice), menu mobilnego, FAQ, lightboxa,
  - formularz: walidację po stronie klienta oraz to, że bez skonfigurowanej
    integracji NIE pojawia się komunikat sukcesu.
"""
import argparse
import os
import sys

from playwright.sync_api import sync_playwright

WIDTHS = [(360, 780), (390, 844), (768, 1024), (1024, 768), (1440, 900), (1920, 1080)]
# Zastępczy obraz (SVG) — używany przy --offline-images, gdy CDN zdjęć jest niedostępny
PLACEHOLDER_SVG = b'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067"><rect width="100%" height="100%" fill="#4a443b"/></svg>'

OVERFLOW_JS = """
() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('dialog:not([open]), [hidden], .hp, .visually-hidden, .skip-link')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // element przycięty przez przodka z overflow:hidden/clip, który sam mieści się w ekranie
    let clipped = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o !== 'visible') { const pr = p.getBoundingClientRect(); if (pr.left >= -1 && pr.right <= vw + 1) { clipped = true; } break; }
    }
    if (clipped) continue;
    if (r.right > vw + 1 || r.left < -1) bad.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? el.className : '').toString().split(' ')[0]} [${Math.round(r.left)}..${Math.round(r.right)}]`);
  }
  return { scrollW: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 12) };
}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:3000")
    ap.add_argument("--shots", default=None)
    ap.add_argument("--offline-images", action="store_true")
    a = ap.parse_args()
    failures = []

    def check(cond, msg):
        print(("  ✓ " if cond else "  ✗ ") + msg)
        if not cond:
            failures.append(msg)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w, h in WIDTHS:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = ctx.new_page()
            if a.offline_images:
                page.route("https://images.unsplash.com/**", lambda r: r.fulfill(status=200, content_type="image/svg+xml", body=PLACEHOLDER_SVG))
                page.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(a.base + "/", wait_until="load")
            page.wait_for_timeout(300)
            print(f"\n[{w}x{h}]")
            # wymuś widoczność animowanych elementów do pomiarów
            page.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'))")
            page.wait_for_timeout(1100)
            res = page.evaluate(OVERFLOW_JS)
            check(res["scrollW"] <= res["vw"], f"brak poziomego przewijania (scrollWidth {res['scrollW']} / {res['vw']})")
            check(not res["bad"], "brak elementów poza ekranem" + (f": {res['bad']}" if res["bad"] else ""))
            check(not errors, "brak błędów JS" + (f": {errors}" if errors else ""))

            if a.shots:
                os.makedirs(a.shots, exist_ok=True)
                page.screenshot(path=f"{a.shots}/full-{w}.png", full_page=True)

            # Nawigacja
            if w < 1024:
                page.click("[data-menu-toggle]")
                check(page.is_visible("#mobile-menu"), "menu mobilne się otwiera")
                check(page.get_attribute("[data-menu-toggle]", "aria-expanded") == "true", "aria-expanded=true")
                page.keyboard.press("Escape")
                check(page.is_hidden("#mobile-menu"), "Esc zamyka menu")
                page.click("[data-menu-toggle]")
                page.click("#mobile-menu a[href='#proces']")
                page.wait_for_timeout(900)
                check(page.is_hidden("#mobile-menu"), "kliknięcie linku zamyka menu")
                top = page.evaluate("document.getElementById('proces').getBoundingClientRect().top")
                check(abs(top) < 140, f"link „Proces” przewija do sekcji (top={round(top)})")
            else:
                for href in ["#uslugi", "#realizacje", "#o-nas", "#proces", "#kontakt"]:
                    page.click(f".nav a[href='{href}']")
                    page.wait_for_timeout(900)
                    top = page.evaluate(f"document.querySelector('{href}').getBoundingClientRect().top")
                    check(abs(top) < 140, f"nawigacja {href} (top={round(top)})")
                check("is-solid" in (page.get_attribute("[data-header]", "class") or ""), "nagłówek staje się pełny po przewinięciu")

            # CTA
            for sel in [".hero a[href='#wycena']", ".hero a[href='#uslugi']"]:
                page.evaluate("window.scrollTo(0,0)")
                page.wait_for_timeout(200)
                page.click(sel)
                page.wait_for_timeout(900)
                target = sel.split("'")[1]
                top = page.evaluate(f"document.querySelector('{target}').getBoundingClientRect().top")
                check(abs(top) < 140, f"CTA w hero → {target}")

            if w in (390, 1440):
                # FAQ
                btn = page.locator(".faq__btn").first
                btn.scroll_into_view_if_needed()
                btn.click()
                check(btn.get_attribute("aria-expanded") == "true" and page.is_visible("#faq-panel-0"), "FAQ rozwija się")
                btn.click()
                check(page.is_hidden("#faq-panel-0"), "FAQ zwija się")
                # Lightbox
                page.locator(".gallery__trigger").nth(1).click()
                check(page.is_visible("[data-lightbox]"), "lightbox się otwiera")
                page.keyboard.press("ArrowRight")
                check("03 /" in page.inner_text("[data-lightbox-count]"), "strzałka przełącza zdjęcie")
                page.keyboard.press("Escape")
                page.wait_for_timeout(200)
                check(page.is_hidden("[data-lightbox]"), "Esc zamyka lightbox")
                # Usługa → preselekcja rodzaju prac
                page.click("a[data-work-type='kuchnia']")
                page.wait_for_timeout(900)
                check(page.input_value("#f-work") == "kuchnia", "„Zapytaj o wycenę” ustawia rodzaj prac")
                # Formularz — pusty
                page.select_option("#f-work", "")
                page.click("[data-submit]")
                check(page.inner_text("#f-name-err") != "" and page.inner_text("#f-consent-err") != "", "walidacja klienta pokazuje błędy")
                check(page.evaluate("document.activeElement.id") == "f-name", "fokus na pierwszym błędnym polu")
                # Formularz — poprawny
                page.fill("#f-name", "Test Testowy")
                page.fill("#f-phone", "600 100 200")
                page.select_option("#f-work", "lazienka")
                page.fill("#f-area", "6")
                page.fill("#f-desc", "Test formularza — remont łazienki ok. 6 m².")
                page.check("#f-consent")
                page.wait_for_timeout(2600)  # minimalny czas wypełniania
                with page.expect_response("**/api/estimate") as resp_info:
                    page.click("[data-submit]")
                resp = resp_info.value
                page.wait_for_selector("[data-status]:not([hidden])")
                status_cls = page.get_attribute("[data-status]", "class")
                text = page.inner_text("[data-status]")
                print(f"    odpowiedź API: {resp.status} · komunikat: {text.splitlines()[0]}")
                if resp.status == 200:
                    check("is-success" in status_cls, "sukces tylko przy potwierdzonej wysyłce (200)")
                else:
                    check("is-error" in status_cls and "is-success" not in status_cls, f"bez integracji: komunikat błędu, brak sukcesu (HTTP {resp.status})")
                if a.shots:
                    page.locator("#estimate-form").screenshot(path=f"{a.shots}/form-{w}.png")
            ctx.close()
        browser.close()

    print(f"\n{'OK' if not failures else 'BŁĘDY: ' + str(len(failures))}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
