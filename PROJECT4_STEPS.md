# Project 4 Checklist

## Your Immediate Local Steps
1. Create MongoDB Atlas free cluster.
2. Create Atlas database user and save the username/password somewhere private.
3. In Atlas Network Access, allow `0.0.0.0/0`.
4. Copy the Atlas connection string and replace the database name with `project4`.
5. Create Cloudinary unsigned upload preset and copy the Cloud Name plus preset name.
6. Copy `.env.example` to `.env` and fill in real values.
7. Seed Atlas:
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

## Partner Work Instructions
Your partner should author at least two pull requests and review yours.

### Partner PR 1: Frontend Upload and Likes Review/Fixes
Files to inspect or adjust:
- `components/TopBar/index.jsx`
- `components/UserPhotos/index.jsx`
- `lib/api.js`
- `lib/queryKeys.js`

Partner should verify:
- Add Photo opens only while logged in.
- Upload sends the file directly to Cloudinary.
- Successful upload appears in the logged-in user's photo feed.
- Like/unlike updates the count and button state.

### Partner PR 2: Deployment and Final Verification
Files to inspect or adjust:
- `README.md`
- `vercel.json`
- `deploy.txt`
- `demo.txt`

Partner should verify:
- Vercel frontend URL works.
- Render backend URL works.
- Registration, login, upload, like/unlike, comments, and logout work in production.
- README URLs match `deploy.txt`.

## Your Pull Requests
### Your PR 1: Backend Upload, Likes, and Tests
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
Files:
- `Dockerfile`
- `.dockerignore`
- `.github/workflows/main.yml`
- `package.json`
- `.gitignore`
- `.env.example`
