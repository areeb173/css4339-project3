# Project 4: Photo Sharing App

## Deployed URLs
- Frontend (Vercel): TODO
- Backend (Render): TODO

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   cd test && npm install && cd ..
   ```
2. Create `.env` in the project root. Do not commit it.
   ```bash
   MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/project4
   SESSION_SECRET=replace-with-a-long-random-string
   CLIENT_ORIGIN=http://localhost:3000
   VITE_API_BASE_URL=http://localhost:3001
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
   ```
3. Seed MongoDB Atlas:
   ```bash
   node loadDatabase.js
   ```
4. Run the app:
   ```bash
   npm run dev
   ```
   Frontend: http://localhost:3000
   Backend: http://localhost:3001

## Docker Backend
Build and run the backend container from the project root:
```bash
docker build -t photo-app-backend .
docker run -p 3001:3001 --env-file .env photo-app-backend
```

## Testing and Linting
```bash
npm run lint
npm test
```

The test command assumes the backend is already running on `http://localhost:3001`.

## Deployment Notes
- Render runs the Dockerfile and must have `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_ORIGIN`, and any other backend environment variables configured.
- Vercel must have `VITE_API_BASE_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, and `VITE_CLOUDINARY_UPLOAD_PRESET` configured.
- GitHub Actions secrets used by `.github/workflows/main.yml`: `MONGODB_URI`, `SESSION_SECRET`, `VITE_API_BASE_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`, `VERCEL_DEPLOY_HOOK_URL`, and `RENDER_DEPLOY_HOOK_URL`.
