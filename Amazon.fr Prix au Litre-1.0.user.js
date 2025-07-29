// ==UserScript==
// @name         Amazon.fr Prix au Litre
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Affiche le prix au litre des produits sur Amazon.fr
// @author       You
// @match        https://www.amazon.fr/s*
// @match        https://www.amazon.fr/*/s*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour extraire le volume depuis le titre du produit
    function extractVolume(title) {
        const text = title.toLowerCase();

        // Patterns pour différents formats de volume
        const patterns = [
            // Litres: "5L", "5 L", "5l", "5 l", "5 litres", "5litres"
            /(\d+(?:[.,]\d+)?)\s*(?:l(?:itres?)?)\b/i,
            // Millilitres: "500ml", "500 ml", "500 ML"
            /(\d+(?:[.,]\d+)?)\s*ml\b/i,
            // Centilitres: "50cl", "50 cl", "50 CL"
            /(\d+(?:[.,]\d+)?)\s*cl\b/i,
        ];

        for (let pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let volume = parseFloat(match[1].replace(',', '.'));

                // Conversion en litres selon l'unité détectée
                if (pattern.source.includes('ml')) {
                    volume = volume / 1000; // ml vers litres
                } else if (pattern.source.includes('cl')) {
                    volume = volume / 100; // cl vers litres
                }
                // Pour les litres, pas de conversion nécessaire

                return volume;
            }
        }

        return null;
    }

    // Fonction pour extraire le prix
    function extractPrice(priceElement) {
        if (!priceElement) return null;

        const priceText = priceElement.textContent || priceElement.innerText;
        const priceMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);

        if (priceMatch) {
            return parseFloat(priceMatch[1].replace(',', '.'));
        }

        return null;
    }

    // Fonction pour créer l'élément prix au litre
    function createPricePerLiterElement(pricePerLiter) {
        const element = document.createElement('div');
        element.style.cssText = `
            color: #007600;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
            padding: 2px 4px;
            background-color: #f0f8f0;
            border-radius: 3px;
            display: inline-block;
        `;
        element.textContent = `${pricePerLiter.toFixed(2)} €/L`;
        return element;
    }

    // Fonction principale pour traiter les produits
    function processProducts() {
        // Sélecteurs pour différents types de pages Amazon
        const productSelectors = [
            '[data-component-type="s-search-result"]', // Pages de recherche
            '[data-asin]:not([data-asin=""])', // Produits avec ASIN
            '.s-result-item', // Résultats de recherche
        ];

        let products = [];
        for (let selector of productSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                products = Array.from(elements);
                break;
            }
        }

        products.forEach(product => {
            // Éviter de traiter plusieurs fois le même produit
            if (product.hasAttribute('data-price-per-liter-processed')) {
                return;
            }
            product.setAttribute('data-price-per-liter-processed', 'true');

            // Chercher le titre du produit
            const titleSelectors = [
                'h2 a span',
                'h2 span',
                '.s-size-mini span',
                '[data-cy="title-recipe-link"]',
                '.a-link-normal .a-text-normal'
            ];

            let titleElement = null;
            let title = '';

            for (let selector of titleSelectors) {
                titleElement = product.querySelector(selector);
                if (titleElement) {
                    title = titleElement.textContent || titleElement.innerText;
                    if (title.trim()) break;
                }
            }

            if (!title) return;

            // Extraire le volume
            const volume = extractVolume(title);
            if (!volume || volume <= 0) return;

            // Chercher le prix
            const priceSelectors = [
                '.a-price-whole',
                '.a-offscreen',
                '.a-price .a-offscreen',
                '.a-price-symbol + .a-price-whole'
            ];

            let priceElement = null;
            let price = null;

            for (let selector of priceSelectors) {
                priceElement = product.querySelector(selector);
                if (priceElement) {
                    price = extractPrice(priceElement);
                    if (price && price > 0) break;
                }
            }

            if (!price || price <= 0) return;

            // Calculer le prix au litre
            const pricePerLiter = price / volume;

            // Chercher où insérer le prix au litre
            const priceContainer = product.querySelector('.a-price, .a-price-range') ||
                                 product.querySelector('[data-cy="price-recipe"]') ||
                                 priceElement?.closest('.a-row, .a-column, div');

            if (priceContainer) {
                const pricePerLiterElement = createPricePerLiterElement(pricePerLiter);

                // Insérer après le conteneur de prix
                if (priceContainer.nextSibling) {
                    priceContainer.parentNode.insertBefore(pricePerLiterElement, priceContainer.nextSibling);
                } else {
                    priceContainer.parentNode.appendChild(pricePerLiterElement);
                }
            }
        });
    }

    // Observer pour détecter les changements de contenu (pagination, tri, etc.)
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldProcess = true;
            }
        });

        if (shouldProcess) {
            setTimeout(processProducts, 500);
        }
    });

    // Démarrer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Traitement initial
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processProducts);
    } else {
        processProducts();
    }

    // Traitement après un délai pour s'assurer que tout est chargé
    setTimeout(processProducts, 1000);
    setTimeout(processProducts, 3000);
})();