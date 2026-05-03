# Project 4 Checklist

## Status Right Now
- Code for Cloudinary URL saving, likes, Docker, GitHub Actions, Vercel config, and backend tests is on branch `feature/project4-in-progress`.
- MongoDB Atlas cluster and database user have been created.
- Local `.env` has the Atlas connection string and session secret. Keep this file private.
- Still needed before full end-to-end testing: Atlas `0.0.0.0/0` Network Access, Cloudinary login/preset, database seed, deployed Vercel/Render URLs.

## Your Immediate Local Steps
1. In Atlas, go to **Security -> Network Access -> IP Access List -> Add IP Address**.
2. Enter `0.0.0.0/0`, add a comment like `Render dynamic IPs`, and save.
3. In Cloudinary, create or log into a free account.
4. Go to **Settings -> Upload -> Upload presets**.
5. Create an unsigned upload preset. Name it something clear, such as `photo_app_unsigned`.
6. Copy the Cloudinary **Cloud name** and the unsigned preset name into `.env`:
   ```bash
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=photo_app_unsigned
   ```
7. Seed Atlas. This resets the app data to the class sample users/photos:
   ```bash
   node loadDatabase.js
   ```
8. Run locally:
   ```bash
   npm run dev
   ```
9. Test locally:
   ```bash
   npm run lint
   npm test
   ```
10. Verify manually at `http://localhost:3000`: register, login, upload a photo, like/unlike it, comment, and logout.

## Partner Work Instructions
Your partner should author at least two pull requests and review yours. Give them these exact tasks:

### Partner PR 1: Frontend Upload and Likes Polish
Branch name: `feature/frontend-upload-polish`

Files to inspect or adjust:
- `components/TopBar/index.jsx`
- `components/UserPhotos/index.jsx`
- `components/TopBar/styles.css`
- `components/UserPhotos/styles.css`
- `lib/api.js`
- `lib/queryKeys.js`

Partner should verify:
- Add Photo opens only while logged in.
- Upload sends the file directly to Cloudinary.
- Errors show when Cloudinary env vars are missing or upload fails.
- Successful upload appears in the logged-in user's photo feed.
- Like/unlike updates the count and button state.
- The UI looks clean on desktop and mobile widths.

Partner should run:
```bash
npm run lint
npm run build
```

### Partner PR 2: Deployment Docs and Final Verification
Branch name: `feature/deployment-verification`

Files to inspect or adjust:
- `README.md`
- `.github/workflows/main.yml`
- `vercel.json`
- `deploy.txt`
- `demo.txt`

Partner should verify:
- Vercel frontend URL works.
- Render backend URL works.
- Registration, login, upload, like/unlike, comments, and logout work in production.
- README URLs match `deploy.txt`.
- GitHub Actions deploy hooks are stored as secrets, not hardcoded.

Partner should run:
```bash
npm run lint
npm test
```

## Your Pull Requests
### Your PR 1: Backend Upload, Likes, and Tests
Branch name: `feature/backend-upload-likes`

Files:
- `schema/photo.js`
- `controllers/photoController.js`
- `routes/photoRoutes.js`
- `lib/serializers.js`
- `loadDatabase.js`
- `test/serverApiTest.js`
- `test/project4ApiTest.js`
- `test/package.json`

### Your PR 2: Docker and CI/CD
Branch name: `feature/docker-ci-cd`

Files:
- `Dockerfile`
- `.dockerignore`
- `.github/workflows/main.yml`
- `package.json`
- `.gitignore`
- `.env.example`

## Final Submission Checklist
1. Merge all PRs into `main` only after partner approval.
2. Confirm `main` has no `.env`, no `node_modules`, no `package-lock.json`.
3. Confirm README contains the real Vercel frontend URL and Render backend URL.
4. Create `repo.txt` with the GitHub repo URL.
5. Create `deploy.txt` with the Vercel URL and Render URL.
6. Create `demo.txt` with the screen recording link.
7. Zip the NetID folder for the submitting partner only.
