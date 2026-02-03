from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Test index.html
        page.goto('http://localhost:8000/index.html')
        page.screenshot(path='/home/jules/verification/index_final.png', full_page=True)

        # Test add-procedure.html
        page.goto('http://localhost:8000/add-procedure.html')
        page.screenshot(path='/home/jules/verification/add_final.png', full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
