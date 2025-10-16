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
        page.screenshot(path="jules-scratch/verification/restored-dark-mode.png")
        theme_toggle.click() # back to light mode

        # Verify Sidebar
        page.click(".hamburger")
        sidebar = page.locator(".sidebar")
        expect(sidebar).to_be_visible()
        sidebar.screenshot(path="jules-scratch/verification/restored-sidebar.png")

        # Verify Add Procedure Page
        page.goto(f"file://{os.getcwd()}/add-procedure.html")
        category_dropdown = page.locator("#category")
        expect(category_dropdown).to_be_visible()
        page.screenshot(path="jules-scratch/verification/restored-add-procedure-page.png")

        # Verify Activity Log
        page.goto(f"file://{os.getcwd()}/index.html")
        activity_log_section = page.locator(".activity-log")
        expect(activity_log_section).to_be_visible()
        activity_log_section.screenshot(path="jules-scratch/verification/restored-activity-log.png")

        browser.close()

if __name__ == "__main__":
    run_verification()