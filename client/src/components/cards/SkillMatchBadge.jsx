import './SkillMatchBadge.css';

export const SkillMatchBadge = ({ score, matchedSkills = [], missingSkills = [], showDetails = false }) => {
  const getScoreColorClass = (s) => {
    if (s >= 75) return 'score-high';
    if (s >= 45) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className={`skill-match-widget ${getScoreColorClass(score)}`}>
      <div className="match-score-header">
        <div className="score-circle-indicator">
          <span className="score-value">{score}%</span>
        </div>
        <div className="match-title-group">
          <strong>Skill Compatibility Match</strong>
          <span>
            {score >= 75
              ? '✨ Strong match for your skill profile'
              : score >= 45
              ? '⚡ Moderate alignment with required stack'
              : '⚠️ Potential technical skill gaps detected'}
          </span>
        </div>
      </div>

      <div className="match-progress-bar-track">
        <div className="match-progress-bar-fill" style={{ width: `${score}%` }} />
      </div>

      {showDetails && (
        <div className="skill-breakdown-details">
          <div className="skills-group">
            <span className="group-title">✓ Matched Skills ({matchedSkills.length})</span>
            <div className="chips-wrapper">
              {matchedSkills.length === 0 ? (
                <span className="no-skills-sub">No matching skills found</span>
              ) : (
                matchedSkills.map((s) => (
                  <span key={s} className="matched-chip">
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="skills-group">
            <span className="group-title missing">✕ Missing Skills ({missingSkills.length})</span>
            <div className="chips-wrapper">
              {missingSkills.length === 0 ? (
                <span className="no-skills-sub" style={{ color: 'var(--success)' }}>
                  All requirements met!
                </span>
              ) : (
                missingSkills.map((s) => (
                  <span key={s} className="missing-chip">
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};