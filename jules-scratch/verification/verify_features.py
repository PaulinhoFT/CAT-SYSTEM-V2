from playwright.sync_api import sync_playwright, expect
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to index page
        page.goto(f"file://{os.getcwd()}/index.html")

        # Verify Dark Mode
        theme_toggle = page.locator("#theme-toggle")
        expect(theme_toggle).to_be_visible()
        theme_toggle.click()
        page.screenshot(path="jules-scratch/verification/dark-mode.png")

        # Verify Subtle Buttons and Categories
        page.click(".hamburger")
        sidebar = page.locator(".sidebar")
        expect(sidebar).to_be_visible()
        page.screenshot(path="jules-scratch/verification/sidebar-view.png")

        # Verify Add Procedure Page
        page.goto(f"file://{os.getcwd()}/add-procedure.html")
        category_dropdown = page.locator("#category")
        expect(category_dropdown).to_be_visible()
        page.screenshot(path="jules-scratch/verification/add-procedure-page.png")

        browser.close()

if __name__ == "__main__":
    run_verification()