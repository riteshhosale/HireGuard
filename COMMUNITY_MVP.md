# JobGuard Community MVP

## Purpose
A security-focused community where job seekers can share reported job-scam experiences and optionally attach JobGuardAI scan results.

## Frontend routes
- `/community`
- `/community/create`
- `/community/post/:postId`

## Backend routes
- `GET /api/v1/community/posts`
- `POST /api/v1/community/posts`
- `GET /api/v1/community/posts/:postId`
- `POST /api/v1/community/posts/:postId/like`
- `POST /api/v1/community/posts/:postId/bookmark`
- `GET /api/v1/community/posts/:postId/comments`
- `POST /api/v1/community/posts/:postId/comments`
- `POST /api/v1/community/posts/:postId/report`

All community routes require the existing JWT authentication middleware.

## Safety rules
- Users are warned to remove phone numbers, private email addresses, OTPs, passwords and identity documents.
- A community post is treated as a reported experience, not proof of wrongdoing.
- Scan attachment is limited to scans owned by the authenticated user.
