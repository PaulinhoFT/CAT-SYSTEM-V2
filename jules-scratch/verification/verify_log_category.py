from playwright.sync_api import sync_playwright, expect
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to index page
        page.goto(f"file://{os.getcwd()}/index.html")

        # Verify Activity Log
        activity_log_section = page.locator(".activity-log")
        expect(activity_log_section).to_be_visible()
        activity_log_section.screenshot(path="jules-scratch/verification/activity-log-with-category.png")

        browser.close()

if __name__ == "__main__":
    run_verification()