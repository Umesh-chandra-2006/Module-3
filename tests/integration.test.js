const axios = require('axios');

const BASE_URL = 'http://localhost:5003/v1';
const headers = { Authorization: 'Bearer <valid_jwt_here>' };

async function testGetAllGroups() {
  const res = await axios.get(`${BASE_URL}/groups`, { headers });
  console.assert(res.status === 200, 'Expected 200');
  console.assert(Array.isArray(res.data.groups), 'Expected groups array');
  console.log('✅ GET /groups passed');
}

async function testGetGroupMembers(groupId) {
  const res = await axios.get(`${BASE_URL}/groups/${groupId}/members`, { headers });
  console.assert(res.status === 200, 'Expected 200');
  console.assert(res.data.members.length <= 7, 'Members exceed 7');
  console.log('✅ GET /groups/:id/members passed');
}

async function testValidateMembership(groupId, userId) {
  const res = await axios.get(
    `${BASE_URL}/groups/${groupId}/members/validate?user_id=${userId}`,
    { headers }
  );
  console.assert(res.data.belongs_to_group === true, 'Expected member to belong');
  console.log('✅ Validate membership passed');
}

async function testNoAuth() {
  try {
    await axios.get(`${BASE_URL}/groups`);
  } catch (err) {
    console.assert(err.response.status === 401, 'Expected 401');
    console.log('✅ No auth 401 passed');
  }
}

async function testInvalidGroup() {
  try {
    await axios.get(`${BASE_URL}/groups/invalid_id`, { headers });
  } catch (err) {
    console.assert(err.response.status === 404, 'Expected 404');
    console.log('✅ Invalid group 404 passed');
  }
}

(async () => {
  await testGetAllGroups();
  await testGetGroupMembers('<group_id>');
  await testValidateMembership('<group_id>', '<user_id>');
  await testNoAuth();
  await testInvalidGroup();
})();
