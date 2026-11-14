# React + Vite

## Portfolio API

The portfolio loads projects from the Flask API at `http://127.0.0.1:5000` by
default. Set `VITE_API_BASE_URL` in a local `.env` file when the API is hosted
elsewhere, for example `VITE_API_BASE_URL=http://localhost:5000`. Project lists
are cached in browser storage for 60 seconds and can be shown offline when a
previous response is available. See [the backend setup guide](../BackEnd/README.md)
for XAMPP/MySQL configuration and the project CRUD API.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
