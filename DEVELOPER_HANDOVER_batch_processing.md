# 🛠️ Developer Handover: Batch Processing Sub-system

This document provides a focused technical overview of the **Batch Processing** functionality within Module 3. It is intended for developers who need to understand the lifecycle of a batch, from creation to management.

---

## 🎯 Overview

The primary responsibility of the batch processing sub-system is to take a list of student identifiers, create a parent "batch" container, and automatically partition the students into smaller groups.

**Core Components:**
*   **Controller**: `controllers/batchController.js` - Handles all API requests for batch creation and retrieval.
*   **Service**: `services/groupingService.js` - Contains the pure logic for the auto-grouping algorithm.
*   **Models**: `models/Batch.js` and `models/Group.js` - Mongoose models that define the data structure stored in MongoDB.

---

## ⚙️ Core Workflow: `createBatch`

The entire batch and group creation process is initiated by a single API call. Understanding this workflow is key to understanding the module.

**Endpoint**: `POST /v1/batches`
**Authorization**: `ADMIN` role required.

### Workflow Steps:

1.  **API Request & Validation**:
    *   The controller receives a request containing a `name` for the batch and an array of `student_ids`.
    *   It immediately validates that both fields are present and that `student_ids` is not empty. If not, it returns a `400 Bad Request`.

2.  **Batch Document Creation**:
    *   A new `Batch` document is instantiated with the provided `name` and the `created_by` field, which is extracted from the authenticated user's JWT payload (`req.user.user_id`).
    *   This new batch document is saved to the database.
    *   **Note**: As per the design specified in `README.md` and `SETUP.md`, the `student_ids` array is **intentionally not** saved on the Batch document itself.

3.  **Auto-Grouping Logic**:
    *   The `student_ids` array from the request body is passed to the `chunkIntoGroups` function in the `groupingService`.
    *   This service chunks the array into sub-arrays, with each containing a maximum of 7 students. The final group will contain any remainder.

4.  **Bulk Group Insertion**:
    *   The resulting chunks are passed to `buildGroupDocuments`. This function maps each chunk into a full Mongoose `Group` document, embedding the `batch_id` from the newly created batch to establish a parent-child relationship.
    *   All new group documents are inserted into the `groups` collection in a single, efficient database operation using `Group.insertMany(groupDocs)`.

5.  **API Response**:
    *   Upon success, the API returns a `201 Created` status with a summary object, including the new `batch_id`, the total number of students processed, and the number of groups created.

---

## 🗄️ Data Models & Relationships

*   **Batch Model (`models/Batch.js`)**: A simple model that primarily serves as a container. It holds a `name` and tracks who created it (`created_by`). Its main purpose is to provide a `_id` that links all associated groups.

*   **Group Model (`models/Group.js`)**: Each group document contains a `batch_id` field of type `ObjectId`, which creates a direct reference to its parent `Batch`. This is critical for queries, such as fetching all groups for a given batch.

---

## 🔗 Supporting Batch Endpoints

These endpoints support the management and viewing of batches after creation.

| Method | Endpoint | Auth Role | Description |
|--------|----------|-----------|-------------|
| `GET` | `/v1/batches` | ADMIN | Lists all created batches, sorted by most recent. |
| `GET` | `/v1/batches/:batch_id` | ADMIN | Retrieves a single batch document and performs a subsequent query to find and embed all associated `Group` documents in the response. |
| `PATCH` | `/v1/batches/groups/:group_id/manager` | ADMIN | While namespaced under batches for clarity, this endpoint updates a `Group` document to assign a manager. |

---

## ⚠️ Key Considerations & Known Limitations

### 1. Transient Student IDs
**Status**: ⚠️ By Design
**Details**: The original list of `student_ids` used to create the groups is not persisted on the `Batch` model. It is used at the moment of creation and then discarded.
**Impact**: It is not possible to retrieve the original, unordered list of all students for a batch directly from the batch object. The full student list must be reconstructed by aggregating the `members` from all associated groups.

### 2. Non-Transactional Creation
**Status**: ℹ️ Informational
**Details**: The creation process involves two separate database writes: one for the `Batch` and one for the `Groups` (`insertMany`). These are not wrapped in a database transaction.
**Impact**: In a rare failure scenario where the `Batch` is saved but `Group.insertMany()` fails, an "orphaned" batch (a batch with no groups) could exist in the database.
**Potential Improvement**: For higher data integrity requirements, this workflow could be wrapped in a MongoDB transaction in the future.

---

## 🧪 Testing

The batch processing logic is thoroughly tested in `tests/module3.test.js`. Key test suites to review are:
*   `[TEST 3] BATCH CREATION (POST /v1/batches)`: Covers successful creation, auth failures, and validation errors.
*   `[TEST 4] AUTO-GROUPING ALGORITHM`: Validates that student lists of various sizes (e.g., 7, 8, 50) are chunked correctly.
*   `[TEST 5] BATCH RETRIEVAL (GET /v1/batches)`: Ensures batch listing and single-batch lookups work as expected.

To run the tests, use `npm test`.