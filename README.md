# Cuteness Overload — Shopify theme

A hyper-simple one-page Shopify theme for a baby onesie store. The home page is the product page: one hero product with gallery, colour swatches, size picker, add to bag, accordions, matching styles and recommendations, newsletter and footer. Plain Liquid, CSS and JavaScript with no build step.

## Connect it to Shopify

1. In Shopify admin go to **Online Store → Themes → Add theme → Connect from GitHub**.
2. Pick this repository and the branch you want (for example `main`).
3. Shopify will pull the theme. Open it with **Customize** to pick the hero product, menus and text.

Once connected, every push to the branch updates the theme automatically.

## Set up the store content

The theme reads products from Shopify, so create them in **Products** first.

- Give each product a **Colour** option (the theme turns it into swatches) and a **Size** option.
- Upload the images in `product-images/` to the matching product. If you assign an image to each colour variant, the swatch shows that image and the gallery switches when a colour is picked.
- Tag a product `new` to show the New badge.
- Create menus under **Navigation**: `main-menu` for the header, `footer` for the footer columns.

In the theme editor, the home page **Product page** section has a product picker. Choose the hero product there. The shelves below pick a collection each, or show all products if left empty.

## Folders

- `layout/` – page shell (`theme.liquid`) and password page
- `templates/` – JSON templates for home, product, collection, cart, search, page, 404, blog, article, password
- `sections/` – header group, footer group, product page, product shelf, newsletter and the simple page sections
- `snippets/` – product card, cart drawer, swatch colour lookup
- `assets/` – `theme.css` and `theme.js`
- `config/` – theme settings (colours, swatch colour list, social links)
- `locales/` – text strings
- `product-images/` – product photography to upload to Shopify (not used by the theme directly)

## Develop locally

```
npm install -g @shopify/cli
shopify theme check
shopify theme dev --store your-store.myshopify.com
```
