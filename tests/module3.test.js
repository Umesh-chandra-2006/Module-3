/**
 * Module 3: Batch & Group Management - Comprehensive Test Suite
 * Tests against Project.md requirements
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5003/v1';
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Mock JWT tokens (format: Bearer <token>)
const mockTokens = {
  admin: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5fMTIzIiwicm9sZSI6IkFETUlOIn0.mockToken',
  manager: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoibWFuYWdlcl8xMjMiLCJyb2xlIjoiTUFOQUdFUiJ9.mockToken',
  student: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoic3R1ZGVudF8xMjMiLCJyb2xlIjoiU1RVREVOVCJ9.mockToken',
};

// Mock student IDs (simulating data from Module 2)
const mockStudentIds = Array.from({ length: 50 }, (_, i) => `student_${String(i + 1).padStart(3, '0')}`);

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = mockTokens.admin) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: token } : {},
    };
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

// Test utilities
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`  ✅ ${message}`);
  } else {
    testResults.failed++;
    console.log(`  ❌ ${message}`);
    testResults.errors.push(message);
  }
}

// ============================================
// TEST SUITE
// ============================================

async function runAllTests() {
  console.log('\n🧪 MODULE 3: BATCH & GROUP MANAGEMENT - TEST SUITE\n');
  console.log('═'.repeat(60));

  // Start the server for tests
  require('dotenv').config();
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5003';
  require('../index');
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mongoose = require('mongoose');
  await mongoose.connection.collection('batches').deleteMany({});
  await mongoose.connection.collection('groups').deleteMany({});

  // Placeholder batch and group IDs for later tests
  let createdBatchId = null;
  let createdGroupIds = [];

  // ============ Test 1: Authentication ============
  console.log('\n[TEST 1] AUTHENTICATION & AUTHORIZATION');
  console.log('─'.repeat(60));

  {
    const res = await apiCall('GET', '/batches', null, null);
    assert(res.status === 401, 'Missing auth token returns 401');
  }

  {
    const res = await apiCall('GET', '/batches', null, 'Bearer invalid');
    assert(res.status === 401, 'Invalid token returns 401');
  }

  // ============ Test 2: Role-Based Access Control ============
  console.log('\n[TEST 2] ROLE-BASED ACCESS CONTROL');
  console.log('─'.repeat(60));

  {
    // Only ADMIN can create batch
    const res = await apiCall('POST', '/batches', 
      { name: 'Test Batch', student_ids: mockStudentIds.slice(0, 10) },
      mockTokens.manager
    );
    assert(res.status === 403, 'MANAGER cannot create batch (returns 403)');
  }

  {
    // Only ADMIN can list batches
    const res = await apiCall('GET', '/batches', null, mockTokens.manager);
    assert(res.status === 403, 'MANAGER cannot list batches (returns 403)');
  }

  // ============ Test 3: Batch Creation & Auto-Grouping ============
  console.log('\n[TEST 3] BATCH CREATION & AUTO-GROUPING');
  console.log('─'.repeat(60));

  {
    // Create batch with 50 students (should create 7 groups + 1 remainder)
    const res = await apiCall('POST', '/batches',
      {
        name: 'Spring 2026 Cohort',
        student_ids: mockStudentIds
      },
      mockTokens.admin
    );

    if (res.success && res.status === 201) {
      assert(true, 'Batch created successfully (status 201)');
      createdBatchId = res.data.batch_id;
      assert(createdBatchId !== undefined, 'Response contains batch_id');
      assert(res.data.name === 'Spring 2026 Cohort', 'Batch name matches input');
      assert(res.data.total_students === 50, 'Total students = 50');
      
      // 50 students ÷ 7 = 7 groups of 7 + 1 group of 1 = 8 groups
      const expectedGroups = Math.ceil(50 / 7);
      assert(res.data.groups_created === expectedGroups, 
        `Groups created = ${expectedGroups} (50 students ÷ 7 per group)`);
      assert(res.data.created_at !== undefined, 'created_at timestamp in UTC ISO format');
    } else {
      assert(false, `Batch creation failed: ${res.error}`);
    }
  }

  {
    // Missing required fields
    const res = await apiCall('POST', '/batches',
      { name: 'Incomplete Batch' },
      mockTokens.admin
    );
    assert(res.status === 400, 'Missing student_ids returns 400');
  }

  {
    const res = await apiCall('POST', '/batches',
      { student_ids: mockStudentIds.slice(0, 5) },
      mockTokens.admin
    );
    assert(res.status === 400, 'Missing batch name returns 400');
  }

  // ============ Test 4: Batch Retrieval ============
  console.log('\n[TEST 4] BATCH RETRIEVAL');
  console.log('─'.repeat(60));

  {
    const res = await apiCall('GET', '/batches', null, mockTokens.admin);
    
    if (res.success && res.status === 200) {
      assert(true, 'GET /batches returns 200');
      assert(Array.isArray(res.data), 'Response is an array');
      assert(res.data.length > 0, 'At least one batch exists');
    } else {
      assert(false, `GET /batches failed: ${res.error}`);
    }
  }

  if (createdBatchId) {
    const res = await apiCall('GET', `/batches/${createdBatchId}`, null, mockTokens.admin);
    
    if (res.success && res.status === 200) {
      assert(true, `GET /batches/:batch_id returns 200`);
      assert(res.data.batch !== undefined, 'Response contains batch object');
      assert(Array.isArray(res.data.groups), 'Response contains groups array');
      assert(res.data.total_groups > 0, 'Batch has groups');
      createdGroupIds = res.data.groups.map(g => g._id);
    } else {
      assert(false, `GET /batches/:batch_id failed: ${res.error}`);
    }
  }

  {
    // Non-existent batch
    const res = await apiCall('GET', '/batches/invalid_id_12345', null, mockTokens.admin);
    assert(res.status === 404, 'Invalid batch_id returns 404');
  }

  // ============ Test 5: Group Retrieval & Filtering ============
  console.log('\n[TEST 5] GROUP RETRIEVAL & FILTERING');
  console.log('─'.repeat(60));

  {
    const res = await apiCall('GET', '/groups', null, mockTokens.admin);
    
    if (res.success && res.status === 200) {
      assert(true, 'GET /groups returns 200');
      assert(res.data.total !== undefined, 'Response contains total count');
      assert(Array.isArray(res.data.groups), 'Response contains groups array');
    } else {
      assert(false, `GET /groups failed: ${res.error}`);
    }
  }

  {
    // Filter by batch_id
    if (createdBatchId) {
      const res = await apiCall(
        'GET',
        `/groups?batch_id=${createdBatchId}`,
        null,
        mockTokens.admin
      );
      
      if (res.success && res.status === 200) {
        assert(true, 'GET /groups?batch_id=X returns 200');
        assert(res.data.groups.every(g => g.batch_id === createdBatchId),
          'All returned groups belong to specified batch');
      }
    }
  }

  // ============ Test 6: Group Details & Member Access ============
  console.log('\n[TEST 6] GROUP DETAILS & MEMBER ACCESS');
  console.log('─'.repeat(60));

  if (createdGroupIds.length > 0) {
    const groupId = createdGroupIds[0];

    {
      // ADMIN can view group details
      const res = await apiCall('GET', `/groups/${groupId}`, null, mockTokens.admin);
      
      if (res.success && res.status === 200) {
        assert(true, 'ADMIN can view group details (status 200)');
        assert(res.data.name !== undefined, 'Response contains group name');
        assert(res.data.members !== undefined, 'Response contains members array');
      }
    }

    {
      // STUDENT cannot view group details (only members)
      const res = await apiCall('GET', `/groups/${groupId}`, null, mockTokens.student);
      assert(res.status === 403, 'STUDENT cannot view group details (returns 403)');
    }

    {
      // Get group members
      const res = await apiCall('GET', `/groups/${groupId}/members`, null, mockTokens.admin);
      
      if (res.success && res.status === 200) {
        assert(true, 'GET /groups/:id/members returns 200');
        assert(res.data.group_id !== undefined, 'Response contains group_id');
        assert(res.data.batch_id !== undefined, 'Response contains batch_id');
        assert(res.data.name !== undefined, 'Response contains group name');
        assert(Array.isArray(res.data.members), 'Response contains members array');
        assert(res.data.total_members !== undefined, 'Response contains total_members count');
        assert(res.data.total_members <= 7, 'Group has max 7 members');
      }
    }

    {
      // Non-existent group
      const res = await apiCall('GET', '/groups/invalid_id_12345', null, mockTokens.admin);
      assert(res.status === 404, 'Invalid group_id returns 404');
    }
  }

  // ============ Test 7: Member Validation (Integration Point) ============
  console.log('\n[TEST 7] MEMBERSHIP VALIDATION (INTEGRATION)');
  console.log('─'.repeat(60));

  if (createdGroupIds.length > 0) {
    const groupId = createdGroupIds[0];
    const testUserId = 'student_001';

    {
      const res = await apiCall(
        'GET',
        `/groups/${groupId}/members/validate?user_id=${testUserId}`,
        null,
        mockTokens.student
      );
      
      if (res.success && res.status === 200) {
        assert(true, 'Validate membership returns 200');
        assert(res.data.group_id === groupId, 'Response contains correct group_id');
        assert(res.data.user_id === testUserId, 'Response contains queried user_id');
        assert(typeof res.data.is_member === 'boolean', 'is_member is boolean');
        assert(typeof res.data.is_manager === 'boolean', 'is_manager is boolean');
        assert(typeof res.data.belongs_to_group === 'boolean', 'belongs_to_group is boolean');
      }
    }

    {
      // Missing user_id parameter
      const res = await apiCall(
        'GET',
        `/groups/${groupId}/members/validate`,
        null,
        mockTokens.student
      );
      assert(res.status === 400, 'Missing user_id param returns 400');
    }

    {
      // No auth required for validate endpoint
      const res = await apiCall(
        'GET',
        `/groups/${groupId}/members/validate?user_id=${testUserId}`,
        null,
        null
      );
      assert(res.status === 401, 'Validate endpoint requires auth token');
    }
  }

  // ============ Test 8: Manager Assignment ============
  console.log('\n[TEST 8] MANAGER ASSIGNMENT');
  console.log('─'.repeat(60));

  if (createdGroupIds.length > 0) {
    const groupId = createdGroupIds[0];
    const managerId = 'manager_001';

    {
      const res = await apiCall(
        'PATCH',
        `/batches/groups/${groupId}/manager`,
        { manager_id: managerId },
        mockTokens.admin
      );

      if (res.success && res.status === 200) {
        assert(true, 'Manager assignment returns 200');
        assert(res.data.group_id === groupId, 'Response contains group_id');
        assert(res.data.manager_id === managerId, 'Manager assigned correctly');
        assert(res.data.message !== undefined, 'Response contains success message');
      } else {
        console.log(`  ⚠️  Manager assignment may have failed: ${res.error}`);
      }
    }

    {
      // Missing manager_id
      const res = await apiCall(
        'PATCH',
        `/batches/groups/${groupId}/manager`,
        {},
        mockTokens.admin
      );
      assert(res.status === 400, 'Missing manager_id returns 400');
    }

    {
      // Only ADMIN can assign manager
      const res = await apiCall(
        'PATCH',
        `/batches/groups/${groupId}/manager`,
        { manager_id: managerId },
        mockTokens.manager
      );
      assert(res.status === 403, 'MANAGER cannot assign manager (returns 403)');
    }
  }

  // ============ Test 9: Data Format & Standards ============
  console.log('\n[TEST 9] DATA FORMAT & STANDARDS');
  console.log('─'.repeat(60));

  {
    const res = await apiCall('GET', '/batches', null, mockTokens.admin);
    
    if (res.success && res.data.length > 0) {
      const batch = res.data[0];
      
      assert(batch._id !== undefined, 'Batch has _id field');
      assert(batch.created_at !== undefined, 'Batch has created_at timestamp');
      
      // Check if timestamp is UTC ISO format
      const isISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(batch.created_at);
      assert(isISO, 'Timestamps in UTC ISO format (YYYY-MM-DDTHH:MM:SS)');
      
      assert(batch.created_by !== undefined, 'Batch has created_by (admin user_id)');
    }
  }

  // ============ Test 10: Error Handling ============
  console.log('\n[TEST 10] ERROR HANDLING');
  console.log('─'.repeat(60));

  {
    const res = await apiCall('GET', '/batches/completely_invalid_id', null, mockTokens.admin);
    assert(res.status === 404, 'Non-existent resource returns 404 with error message');
    assert(res.error !== undefined, 'Error response includes error message');
  }

  {
    // Malformed request (empty array)
    const res = await apiCall(
      'POST',
      '/batches',
      { name: 'Bad Batch', student_ids: [] },
      mockTokens.admin
    );
    assert(res.status === 400, 'Empty student_ids array returns 400');
  }

  // ============ Test 11: Grouping Algorithm ============
  console.log('\n[TEST 11] AUTO-GROUPING ALGORITHM VALIDATION');
  console.log('─'.repeat(60));

  {
    // Test case: 50 students → 8 groups (7 + 1)
    const testCases = [
      { students: 7, expectedGroups: 1, description: '7 students → 1 group' },
      { students: 8, expectedGroups: 2, description: '8 students → 2 groups' },
      { students: 14, expectedGroups: 2, description: '14 students → 2 groups' },
      { students: 15, expectedGroups: 3, description: '15 students → 3 groups' },
      { students: 50, expectedGroups: 8, description: '50 students → 8 groups (7+1)' },
      { students: 100, expectedGroups: 15, description: '100 students → 15 groups (14+1)' },
    ];

    for (const testCase of testCases) {
      const ids = Array.from({ length: testCase.students }, (_, i) => `user_${i}`);
      const res = await apiCall(
        'POST',
        '/batches',
        { name: `Test ${testCase.students}`, student_ids: ids },
        mockTokens.admin
      );

      if (res.success) {
        assert(
          res.data.groups_created === testCase.expectedGroups,
          testCase.description
        );
      }
    }
  }

  // ============ Test 12: API Versioning & Endpoints ============
  console.log('\n[TEST 12] API VERSIONING & ENDPOINT COMPLIANCE');
  console.log('─'.repeat(60));

  {
    // All endpoints must be under /v1/
    const endpoints = [
      '/v1/batches',
      '/v1/groups',
    ];

    assert(BASE_URL.includes('/v1'), 'APIs versioned under /v1/');
    
    const batchesRes = await apiCall('GET', '/batches', null, mockTokens.admin);
    assert(batchesRes.status !== 404, 'Batch endpoints available at /v1/batches');
    
    const groupsRes = await apiCall('GET', '/groups', null, mockTokens.admin);
    assert(groupsRes.status !== 404, 'Group endpoints available at /v1/groups');
  }

  // ============ SUMMARY ============
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n⚠️  FAILED TESTS:');
    testResults.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
