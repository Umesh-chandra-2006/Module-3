/**
 * Chunks an array of student IDs into groups of given size.
 * Last group absorbs remainder.
 *
 * Example: 500 students → 71 groups of 7 + 1 group of 3 = 72 groups total
 */
function chunkIntoGroups(studentIds, size = 7) {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error('studentIds must be a non-empty array');
  }

  const groups = [];
  for (let i = 0; i < studentIds.length; i += size) {
    groups.push(studentIds.slice(i, i + size));
  }
  return groups;
}

/**
 * Builds Group documents from chunked arrays.
 */
function buildGroupDocuments(chunks, batchId, batchName) {
  return chunks.map((members, index) => ({
    batch_id: batchId,
    name: `${batchName} - Group ${index + 1}`,
    members,
    manager_id: null,
    created_at: new Date().toISOString(),
  }));
}

module.exports = { chunkIntoGroups, buildGroupDocuments };
