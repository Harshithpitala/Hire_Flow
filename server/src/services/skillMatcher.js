/**
 * Smart Skill Matching Algorithm
 * Calculates deterministic alignment score and identifies skill gaps.
 * 
 * @param {Array<string>} candidateSkills - Array of skills possessed by the student
 * @param {Array<string>} requiredSkills - Array of skills demanded by the job opening
 * @returns {Object} { score: number, matchedSkills: string[], missingSkills: string[] }
 */
const calculateSkillMatch = (candidateSkills = [], requiredSkills = []) => {
  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return {
      score: 100,
      matchedSkills: candidateSkills || [],
      missingSkills: []
    };
  }

  // Normalize candidate skills into a Fast Lookup Set (O(1) lookups)
  const candidateSet = new Set(
    (candidateSkills || []).map((s) => s.trim().toLowerCase()).filter(Boolean)
  );

  const matchedSkills = [];
  const missingSkills = [];

  // Deduplicate and process required skills
  const normalizedRequired = [
    ...new Set(requiredSkills.map((s) => s.trim().toLowerCase()).filter(Boolean))
  ];

  if (normalizedRequired.length === 0) {
    return {
      score: 100,
      matchedSkills: candidateSkills || [],
      missingSkills: []
    };
  }

  normalizedRequired.forEach((reqSkill) => {
    if (candidateSet.has(reqSkill)) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const score = Math.round((matchedSkills.length / normalizedRequired.length) * 100);

  return {
    score,
    matchedSkills,
    missingSkills
  };
};

module.exports = { calculateSkillMatch };