# Cuteness Overload

A hyper-simple one-page store for a baby onesie. Plain HTML, CSS and JavaScript with no build step and no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## What's on the page

- Utility bar, promo strip and sticky header with logo, category nav, search, wishlist and bag icons
- Breadcrumb
- Product gallery with four views, thumbnails, arrows and keyboard navigation
- Product panel: New badge, title, price, colour swatches (Dusty Pink, Milk, Dark Navy), size select, quantity, Add to Bag, save to wishlist, stock note
- Accordions: What we love, Materials care & size, Sustainability, Delivery & returns
- Matching styles carousel and You may also like grid
- Newsletter signup, four-column footer, legal links and payment badges
- Slide-out bag drawer; bag and wishlist persist in localStorage
- `?swatch=Milk` in the URL preselects a colour

Product images are inline SVG illustrations generated in `app.js`, so you can swap in photographs by replacing the `galleryImages` and `cardArt` functions with `<img>` tags.

## Files

- `index.html` – page structure and copy
- `styles.css` – layout and styling
- `app.js` – product data, illustrations, gallery, bag and wishlist
