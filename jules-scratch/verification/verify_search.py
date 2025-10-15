from playwright.sync_api import sync_playwright, expect
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navega para o arquivo local
        page.goto(f"file://{os.getcwd()}/index.html")

        # Clica no menu hamburguer para abrir a barra lateral
        page.click(".hamburger")

        # Espera o input de pesquisa ficar visível
        search_input = page.locator("#search-input")
        expect(search_input).to_be_visible()

        # Tira um screenshot da barra lateral
        page.locator(".sidebar").screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()