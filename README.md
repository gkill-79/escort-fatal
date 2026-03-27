# Separated Front-end and Back-end structure

The project has been refactored into two main directories:

- `front-end/`: Contains the Next.js application. Run with `npm run dev` inside this folder.
- `back-end/`: Contains the Express/Socket.io server and Prisma schema. Run with `npm run dev` inside this folder.

To start the project:
1. In `back-end/`, run `npm install` and `npm run dev`.
2. In `front-end/`, run `npm install` and `npm run dev`.

The frontend now expects the backend to be running on `http://localhost:4000`.
