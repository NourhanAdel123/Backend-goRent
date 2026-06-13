# GoRent Auth API

Base URL: `http://localhost:5000/api/auth`

## Overview

This API provides authentication endpoints for user registration and login.

## Endpoints

### Register a user

`POST /register`

Registers a new user account.

This endpoint also accepts an optional `profileImage` file in `multipart/form-data` and stores it in Cloudinary.

Request body:

```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "Password123!",
  "role": "tenant"
}
```

Body fields:

| Field        | Type   | Required | Description                                     |
| ------------ | ------ | -------- | ----------------------------------------------- |
| name         | string | yes      | User full name                                  |
| email        | string | yes      | Unique email address                            |
| password     | string | yes      | Plain-text password, hashed before saving       |
| role         | string | no       | One of `tenant`, `owner`, `admin`, `superadmin` |
| profileImage | file   | no       | Optional profile image uploaded to Cloudinary   |

Success response:

```json
{
  "success": true,
  "user": {
    "_id": "66a0f2c5f3f3d6d9b1a11111",
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "tenant",
    "createdAt": "2026-06-02T10:00:00.000Z",
    "updatedAt": "2026-06-02T10:00:00.000Z"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "User already exists"
}
```

### Login

`POST /login`

Authenticates a user and returns a JWT token.

Request body:

```json
{
  "email": "ahmed@example.com",
  "password": "Password123!"
}
```

Body fields:

| Field    | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| email    | string | yes      | Registered email |
| password | string | yes      | User password    |

Success response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66a0f2c5f3f3d6d9b1a11111",
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "tenant"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## cURL examples

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "name=Ahmed Ali" \
  -F "email=ahmed@example.com" \
  -F "password=Password123!" \
  -F "role=tenant" \
  -F "profileImage=@/path/to/image.jpg"
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@example.com","password":"Password123!"}'
```

## Notes

- The API uses `JWT_SECRET` from `.env` to sign login tokens.
- The `password` field is hashed automatically before saving.
- If MongoDB is unavailable, the server will stop during startup.
- Multer and Cloudinary are used for image uploads.
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env` before uploading images.
