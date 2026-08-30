import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './CompanyProfilePage.css';

export const CompanyProfilePage = () => {
  const { user, updateUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Recruiter Personal Form State
  const [recruiterName, setRecruiterName] = useState('');
  const [designation, setDesignation] = useState('');
  const [recruiterPhone, setRecruiterPhone] = useState('');
  const [recruiterLinkedin, setRecruiterLinkedin] = useState('');

  // Company Form State
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Software Development');
  const [companySize, setCompanySize] = useState('11-50');
  const [headquarters, setHeadquarters] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/recruiters/profile/me');
      if (res.data.success) {
        const p = res.data.data;
        setRecruiterName(p.user?.name || user?.name || '');
        setDesignation(p.designation || 'Technical Recruiter');
        setRecruiterPhone(p.phone || '');
        setRecruiterLinkedin(p.linkedin || '');

        if (p.company) {
          setCompanyName(p.company.name || '');
          setTagline(p.company.tagline || '');
          setDescription(p.company.description || '');
          setWebsite(p.company.website || '');
          setIndustry(p.company.industry || 'Software Development');
          setCompanySize(p.company.companySize || '11-50');
          setHeadquarters(p.company.headquarters || '');
          setIsVerified(p.company.isVerified || false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organization profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecruiterProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const res = await api.put('/recruiters/profile', {
        name: recruiterName,
        designation,
        phone: recruiterPhone,
        linkedin: recruiterLinkedin
      });

      if (res.data.success) {
        setSuccessMessage('Representative details updated successfully!');
        if (recruiterName !== user?.name) {
          updateUserState({ name: recruiterName });
        }
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update representative details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyName || !description || !headquarters) {
      setError('Please provide company name, overview, and headquarters.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const res = await api.post('/recruiters/company', {
        name: companyName,
        tagline,
        description,
        website,
        industry,
        companySize,
        headquarters
      });

      if (res.data.success) {
        setSuccessMessage('Company profile saved successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading corporate workspace..." />;
  }

  return (
    <div className="company-profile-wrapper">
      <div className="company-header-row">
        <div>
          <h1 className="company-main-title">Employer Profile</h1>
          <p className="company-subtitle">Manage company branding and hiring representative credentials.</p>
        </div>
        {companyName && (
          <Badge variant={isVerified ? 'success' : 'warning'} size="md">
            {isVerified ? '✓ Verified Employer' : '⏳ Verification Pending'}
          </Badge>
        )}
      </div>

      <ErrorMessage message={error} />
      {successMessage && <div className="company-success-banner">{successMessage}</div>}

      <div className="company-tabs-nav">
        <button
          type="button"
          className={`company-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          🏢 Organization Details
        </button>
        <button
          type="button"
          className={`company-tab-btn ${activeTab === 'representative' ? 'active' : ''}`}
          onClick={() => setActiveTab('representative')}
        >
          👤 Representative Info
        </button>
      </div>

      {activeTab === 'company' && (
        <form className="card company-pane" onSubmit={handleSaveCompany}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-title">Corporate Identity & Branding</h3>
            <Button variant="primary" type="submit" isLoading={saving}>
              Save Company Info
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Company Legal Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
            />
            <Input
              label="Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Building the future of cloud infrastructure"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="input-group">
              <label className="input-label">Primary Industry</label>
              <select
                className="input-field"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option>Information Technology & Services</option>
                <option>Financial Technology (FinTech)</option>
                <option>Software Development</option>
                <option>Healthcare & Life Sciences</option>
                <option>E-Commerce & Retail</option>
                <option>Artificial Intelligence & Data</option>
                <option>Telecommunications</option>
                <option>Consulting & Professional Services</option>
                <option>Education Technology (EdTech)</option>
                <option>Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Company Size</label>
              <select
                className="input-field"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>201-500</option>
                <option>501-1000</option>
                <option>1000+</option>
              </select>
            </div>

            <Input
              label="Headquarters"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              placeholder="e.g. San Francisco, CA / Bengaluru, IN"
              required
            />
          </div>

          <Input
            label="Corporate Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://acmecorp.com"
          />

          <div className="input-group">
            <label className="input-label">About the Company / Culture <span className="input-required">*</span></label>
            <textarea
              className="input-field"
              rows="5"
              placeholder="Provide a comprehensive introduction to your mission, values, work culture, and recruitment process..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </form>
      )}

      {activeTab === 'representative' && (
        <form className="card company-pane" onSubmit={handleSaveRecruiterProfile}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-title">Hiring Representative Credentials</h3>
            <Button variant="primary" type="submit" isLoading={saving}>
              Save Representative Info
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Full Name"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              required
            />
            <Input
              label="Corporate Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Lead Technical Recruiter / Talent Acquisition Specialist"
              required
            />
            <Input
              label="Contact Phone"
              value={recruiterPhone}
              onChange={(e) => setRecruiterPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
            />
            <Input
              label="LinkedIn Profile"
              value={recruiterLinkedin}
              onChange={(e) => setRecruiterLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/recruiter-profile"
            />
          </div>
        </form>
      )}
    </div>
  );
};