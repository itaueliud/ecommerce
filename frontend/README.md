# Danaba Frontend

React marketplace frontend for the Danaba FMCG procurement platform.

## Run

```bash
npm install
npm run dev
```

The page uses demo catalog data by default and will automatically try to read:

- `GET http://localhost:5000/api/categories`
- `GET http://localhost:5000/api/products`
- `POST http://localhost:5000/api/auth/login`
- `POST http://localhost:5000/api/auth/register`

Run the backend on port `5000` to replace demo products with database products.

## File Map

- `src/App.jsx` keeps shared app state and routes.
- `src/pages` contains route-level pages.
- `src/components` contains reusable UI pieces.
- `src/data/catalog.js` contains demo catalog data.
