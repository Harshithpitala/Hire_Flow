import './ApplicationTimeline.css';

export const ApplicationTimeline = ({ currentStatus }) => {
  const stages = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'SELECTED', label: 'Selected' }
  ];

  const stageOrder = {
    APPLIED: 0,
    UNDER_REVIEW: 1,
    SHORTLISTED: 2,
    ASSESSMENT: 2,
    INTERVIEW: 3,
    SELECTED: 4,
    REJECTED: -1
  };

  const currentIndex = stageOrder[currentStatus] ?? 0;
  const isRejected = currentStatus === 'REJECTED';

  if (isRejected) {
    return (
      <div className="timeline-rejected-box">
        <span className="rejected-icon">✕</span>
        <span>Application Not Selected for this position</span>
      </div>
    );
  }

  return (
    <div className="app-timeline">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={stage.key}
            className={`timeline-step ${isCompleted ? 'step-completed' : ''} ${
              isCurrent ? 'step-active' : ''
            }`}
          >
            <div className="step-bullet">
              {isCompleted ? '✓' : index + 1}
            </div>
            <span className="step-label">{stage.label}</span>
            {index < stages.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
};