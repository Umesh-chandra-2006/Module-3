# Module 3: Batch & Group Management - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd module3
npm install
```

### 2. Environment Variables Required

Create or update `.env` file with these variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/module3

# Authentication
JWT_SECRET=your_jwt_secret_key_here
AUTH_SERVICE_URL=http://localhost:5001

# Module 2 (User Service) - for future integration
USER_SERVICE_URL=http://localhost:5002

# Server
PORT=5003
NODE_ENV=development
```

### 3. Run Module

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

**Output**: Server will listen on `http://localhost:5003`

### 4. Run Tests

```bash
npm test
```

This runs comprehensive tests against all Project.md requirements.

---

## 📋 Environment Variables Explained

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `MONGO_URI` | ✅ Yes | - | MongoDB connection string. Use `mongodb://localhost:27017/module3` for local dev |
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT validation. Must match Module 1 |
| `AUTH_SERVICE_URL` | ✅ Yes | - | Module 1 auth service endpoint (used for token validation) |
| `USER_SERVICE_URL` | ⚠️ Optional | - | Module 2 user service (future integration) |
| `PORT` | ✅ Yes | `5003` | Port where Module 3 server runs |
| `NODE_ENV` | ✅ Yes | `development` | Set to `development` for mock routes, `production` to disable |

---

## 🔐 Mock Authentication for Testing

The test suite uses mock JWT tokens (these won't actually validate against Module 1):

```javascript
// For manual testing, create real tokens by calling Module 1:
// POST http://localhost:5001/auth/login
// Body: { email: "admin@example.com", password: "password" }
```

To test with real tokens:
1. Start Module 1 (Auth Service) on port 5001
2. Login to get a real JWT token
3. Use that token in API requests: `Authorization: Bearer <token>`

---

## 🗂️ Module File Structure

```
module3/
├── index.js                    # Express app entry point
├── package.json                # Dependencies
├── .env                        # Environment variables (CREATE THIS)
├── config/
│   └── db.js                   # MongoDB connection
├── models/
│   ├── Batch.js                # Batch model (imports from schema/)
│   └── Group.js                # Group model (imports from schema/)
├── controllers/
│   ├── batchController.js      # Batch API handlers
│   └── groupController.js      # Group API handlers
├── routes/
│   ├── batchRoutes.js          # Batch API routes
│   └── groupRoutes.js          # Group API routes
├── services/
│   └── groupingService.js      # Auto-grouping algorithm
├── middleware/
│   ├── auth.js                 # JWT validation middleware
│   └── authorize.js            # Role-based authorization
├── mocks/
│   └── mockRoutes.js           # Mock data endpoints (dev only)
└── tests/
    ├── module3.test.js         # Comprehensive test suite
    └── integration.test.js     # Basic integration tests
```

---

## 📡 API Endpoints Summary

All endpoints require JWT token in `Authorization: Bearer <token>` header.

### Batch Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/batches` | ADMIN | Create batch + auto-generate groups |
| `GET` | `/v1/batches` | ADMIN | List all batches |
| `GET` | `/v1/batches/:batch_id` | ADMIN | Get batch with groups |
| `PATCH` | `/v1/batches/groups/:group_id/manager` | ADMIN | Assign manager to group |

### Group Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/v1/groups` | ADMIN | List all groups (supports `?batch_id=X` filter) |
| `GET` | `/v1/groups/:group_id` | ADMIN, MANAGER | Get group details |
| `GET` | `/v1/groups/:group_id/members` | ADMIN, MANAGER, STUDENT | Get group members |
| `GET` | `/v1/groups/:group_id/members/validate?user_id=X` | ALL | Validate user membership |

### Mock Endpoints (dev only, when NODE_ENV=development)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/mock/v1/groups` | Mock group list |
| `GET` | `/mock/v1/groups/:group_id/members` | Mock member list |
| `GET` | `/mock/v1/groups/:group_id/members/validate` | Mock membership validation |

---

## ✅ Testing

### Run Full Test Suite
```bash
npm test
```

Runs all tests including:
- ✅ Authentication & authorization
- ✅ Batch CRUD operations
- ✅ Auto-grouping algorithm (50 → 8 groups, etc.)
- ✅ Group member access control
- ✅ Membership validation
- ✅ Manager assignment
- ✅ Data format & standards (UTC ISO timestamps)
- ✅ Error handling (400, 403, 404, 500)
- ✅ API versioning (/v1/)

---

## ⚠️ Important Notes

### 1. Schema Limitation
The current Batch schema in `schema/Batch.js` does **NOT** include a `student_ids` field. The implementation stores student IDs during batch creation and passes them to `chunkIntoGroups()`, but does not persist them in the database.

**If you need to retrieve student_ids later**, the Batch schema needs to be updated to include:
```javascript
student_ids: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'User',
  required: true,
}
```

### 2. Module Interdependencies
Module 3 depends on:
- **Module 1 (Auth)**: Token validation at `AUTH_SERVICE_URL/auth/validate`
- **Schema files**: Batch and Group models in `../schema/`

Make sure both are running/accessible before starting Module 3.

### 3. Database Requirements
- MongoDB must be running on `MONGO_URI`
- Ensure database `module3` exists or MongoDB will auto-create it

### 4. Development Mode
When `NODE_ENV=development`:
- Mock routes available at `/mock/v1/groups`
- Use for testing other modules without real data

When `NODE_ENV=production`:
- Mock routes disabled

---

## 🧪 Integration with Other Modules

### Module 4 (Chat) → Calls Module 3
```
Chat service validates group membership:
GET /v1/groups/:group_id/members/validate?user_id=<user_id>
```

### Module 5 (Activity) → Calls Module 3
```
Activity service validates before logging:
GET /v1/groups/:group_id/members/validate?user_id=<user_id>
```

### Module 6 & 7 (Analytics) → Calls Module 3
```
Fetch group structure:
GET /v1/groups
GET /v1/groups/:group_id/members
```

---

## 🐛 Troubleshooting

### Problem: `MONGO_URI not found`
**Solution**: Add `MONGO_URI` to `.env` file

### Problem: `Cannot connect to AUTH_SERVICE_URL`
**Solution**: Ensure Module 1 is running on correct port

### Problem: `student_ids field not found in Batch`
**Solution**: This is a known limitation. See "Schema Limitation" section above.

### Problem: Tests fail with 401 errors
**Solution**: 
- Ensure Module 1 is running
- Or update test to use real tokens from Module 1

### Problem: `Port 5003 already in use`
**Solution**: 
```bash
# Change PORT in .env to available port (e.g., 5004)
PORT=5004
npm start
```

---

## 📝 Project.md Compliance Checklist

✅ **Authentication**: JWT required on every endpoint
✅ **Authorization**: Role-based (ADMIN/MANAGER/STUDENT)
✅ **Auto-Grouping**: Chunks students into groups of 7
✅ **API Versioning**: All endpoints under `/v1/`
✅ **Naming Conventions**: Uses `user_id`, `group_id`, `batch_id`
✅ **Timestamps**: UTC ISO format
✅ **Error Handling**: 400/403/404/500 with messages
✅ **Integration Points**: Provides endpoints for Modules 4, 5, 6, 7

---

## 📞 Next Steps

1. **Setup**: Create `.env` with variables above
2. **Install**: Run `npm install`
3. **Database**: Ensure MongoDB is running
4. **Test**: Run `npm test`
5. **Start**: Run `npm run dev`
6. **Verify**: All tests pass with ✅

---

Generated: May 6, 2026
