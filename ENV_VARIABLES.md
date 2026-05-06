# ⚙️ ENVIRONMENT VARIABLES NEEDED FOR MODULE 3

## Create a `.env` file in the `module3/` folder with these variables:

```env
# === REQUIRED VARIABLES ===

# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/module3

# JWT Secret (must match Module 1)
JWT_SECRET=your_jwt_secret_key_here

# Module 1 (Auth Service) URL - used for token validation
AUTH_SERVICE_URL=http://localhost:5001

# Server Configuration
PORT=5003
NODE_ENV=development

# === OPTIONAL VARIABLES ===

# Module 2 (User Service) URL - for future integration
USER_SERVICE_URL=http://localhost:5002
```

---

## 📋 Variable Details

### 1. **MONGO_URI** (Required)
- **Purpose**: MongoDB connection string
- **Default**: Not set
- **Example**: `mongodb://localhost:27017/module3`
- **For Local Dev**: `mongodb://localhost:27017/module3`
- **For Cloud (Atlas)**: `mongodb+srv://user:password@cluster.mongodb.net/module3`

### 2. **JWT_SECRET** (Required)
- **Purpose**: Secret key for JWT token validation
- **Default**: Not set
- **Important**: Must match the secret used in Module 1 (Auth Service)
- **Example**: `my_secret_key_12345` or any strong string
- **Security**: Use a strong random string in production

### 3. **AUTH_SERVICE_URL** (Required)
- **Purpose**: Module 1 endpoint for validating JWT tokens
- **Default**: Not set
- **Example**: `http://localhost:5001`
- **Used By**: `middleware/auth.js` to validate tokens before processing requests

### 4. **PORT** (Required)
- **Purpose**: Port on which Module 3 server listens
- **Default**: `5003`
- **Example**: `5003` (or `5004` if port is already in use)
- **Note**: Make sure this port is free

### 5. **NODE_ENV** (Required)
- **Purpose**: Environment mode
- **Default**: `development`
- **Options**: 
  - `development`: Mock routes enabled at `/mock/v1/groups`
  - `production`: Mock routes disabled
- **Example**: `development` for testing, `production` for deployment

### 6. **USER_SERVICE_URL** (Optional)
- **Purpose**: Module 2 endpoint (for future integration)
- **Default**: Not set
- **Currently**: Not used in Module 3 implementation
- **Example**: `http://localhost:5002`

---

## 🚀 Setup Instructions

### Step 1: Create `.env` file
```bash
cd module3
touch .env
```

### Step 2: Add variables to `.env`
Copy the template above and fill in your values:
```env
MONGO_URI=mongodb://localhost:27017/module3
JWT_SECRET=your_secret_here
AUTH_SERVICE_URL=http://localhost:5001
PORT=5003
NODE_ENV=development
```

### Step 3: Verify MongoDB is running
```bash
# On Windows (if MongoDB is installed):
mongod

# Or check if it's already running
mongo --eval "db.version()"
```

### Step 4: Install dependencies
```bash
npm install
```

### Step 5: Start Module 3
```bash
npm run dev        # Development with auto-reload
# or
npm start          # Production mode
```

### Step 6: Run tests
```bash
npm test
```

---

## ⚠️ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `MONGO_URI is not defined` | Missing in `.env` | Add `MONGO_URI=mongodb://localhost:27017/module3` |
| `Cannot connect to database` | MongoDB not running | Start MongoDB service |
| `401 Unauthorized` | `AUTH_SERVICE_URL` incorrect | Verify Module 1 is running on that URL |
| `Port 5003 already in use` | Port is busy | Change `PORT=5004` in `.env` |
| `Cannot find module axios` | Dependencies not installed | Run `npm install` |
| `JWT validation fails` | `JWT_SECRET` mismatch | Match secret from Module 1 |

---

## ✅ How to Verify Setup is Correct

1. **Check MongoDB**
   ```bash
   mongosh "mongodb://localhost:27017/module3"
   ```
   Should connect successfully

2. **Check Module 1 is accessible**
   ```bash
   curl http://localhost:5001/health  # or similar endpoint
   ```

3. **Start Module 3**
   ```bash
   npm run dev
   ```
   Should see: `Module 3 running on port 5003`

4. **Test an endpoint**
   ```bash
   curl http://localhost:5003/v1/batches \
     -H "Authorization: Bearer test_token"
   ```
   Should return 401 (invalid token is expected at this stage)

5. **Run full test suite**
   ```bash
   npm test
   ```
   Should show pass/fail statistics

---

## 📝 Sample `.env` File (Copy & Paste)

```env
# Database
MONGO_URI=mongodb://localhost:27017/module3

# JWT and Auth
JWT_SECRET=my_jwt_secret_key_12345
AUTH_SERVICE_URL=http://localhost:5001

# User Service (optional)
USER_SERVICE_URL=http://localhost:5002

# Server
PORT=5003
NODE_ENV=development
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**:
- Never commit `.env` to Git (add to `.gitignore`)
- Use strong `JWT_SECRET` (minimum 32 characters)
- Use secure MongoDB connection with authentication
- Set `NODE_ENV=production` in production
- Use environment-specific URLs for all services

---

## Need Help?

If tests fail, check:
1. All variables in `.env` are set
2. MongoDB is running: `mongosh`
3. Module 1 is running on the URL in `AUTH_SERVICE_URL`
4. No syntax errors in `.env` file

Once set up, run: `npm test`
