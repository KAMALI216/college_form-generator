import React from 'react';
import '../../styles/FormCard.css';
import { 
  AccessTime as TimeIcon, 
  AttachMoney as MoneyIcon, 
  FileCopy as DocsIcon,
  Description as FormIcon,
  School as AcademicIcon,
  Home as HostelIcon,
  EmojiEvents as ScholarshipIcon,
  Badge as CertIcon,
  AccountCircle as UserIcon
} from '@mui/icons-material';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'academic': return <AcademicIcon />;
    case 'hostel': return <HostelIcon />;
    case 'scholarships': return <ScholarshipIcon />;
    case 'certificates': return <CertIcon />;
    case 'student services': return <UserIcon />;
    default: return <FormIcon />;
  }
};

const getCategoryClass = (category) => {
  switch (category?.toLowerCase()) {
    case 'academic': return 'cat-academic';
    case 'hostel': return 'cat-hostel';
    case 'scholarships': return 'cat-scholarships';
    case 'certificates': return 'cat-certificates';
    case 'student services': return 'cat-services';
    default: return 'cat-default';
  }
};

function FormCard({ template, userSubmission, onViewDetails }) {
  // Mock data for new UI requirements that might not be in template yet
  const category = template.category || 'Academic';
  const estimatedTime = template.estimatedTime || '5 mins';
  const requiredDocs = template.requiredDocs || 0;
  
  // Determine application state
  let appState = 'NOT_STARTED';
  let primaryLabel = 'Fill Form';
  let secondaryLabel = 'View Details';
  let badgeLabel = template.status || 'APPROVED';
  
  if (userSubmission) {
    const subStatus = userSubmission.status || 'PENDING';
    badgeLabel = subStatus.replace('_', ' ');
    if (subStatus === 'APPROVED') {
      appState = 'APPROVED';
      secondaryLabel = 'View Submission';
      primaryLabel = 'View Status';
    } else if (subStatus === 'CORRECTION_REQUIRED' || subStatus === 'REJECTED') {
      appState = 'REJECTED';
      secondaryLabel = 'View Details';
      primaryLabel = 'View Status';
    } else if (subStatus === 'DRAFT' || subStatus === 'IN_PROGRESS') {
      appState = 'IN_PROGRESS';
      secondaryLabel = 'View Details';
      primaryLabel = 'Continue Application';
    } else {
      appState = 'SUBMITTED';
      secondaryLabel = 'View Submission';
      primaryLabel = 'Track Status';
    }
  }

  const catClass = getCategoryClass(category);

  return (
    <div className="student-service-card">
      <div className="card-content">
        <div className="card-category-row">
          <div className={`card-icon ${catClass}`}>
            {getCategoryIcon(category)}
          </div>
          <div className={`card-category-badge ${catClass}-badge`}>
            {category}
          </div>
          <div 
            className="card-status-badge"
            style={{ 
              backgroundColor: appState === 'NOT_STARTED' || appState === 'IN_PROGRESS' ? '#10b981' : (appState === 'REJECTED' ? '#ef4444' : '#3b82f6'),
              color: '#ffffff'
            }}
          >
            {badgeLabel}
          </div>
        </div>

        <h3 className="card-title">
          {template.formName || template.form_name}
        </h3>
        
        <p className="card-description">
          {template.description || 'Application form for student services.'}
        </p>

        <div className="card-meta">
          <div className="card-meta-item">
            <TimeIcon style={{ fontSize: 18 }} />
            <span>{estimatedTime}</span>
          </div>
          <div className="card-meta-item card-documents">
            <DocsIcon style={{ fontSize: 18 }} />
            <span>{requiredDocs} required documents</span>
          </div>
        </div>
      </div>
      
      <div className="card-actions">
        <button 
          className="view-details-button"
          onClick={() => onViewDetails(template, false, appState)}
        >
          {secondaryLabel}
        </button>
        <button 
          className="primary-action-button"
          onClick={() => onViewDetails(template, true, appState)}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

export default FormCard;
