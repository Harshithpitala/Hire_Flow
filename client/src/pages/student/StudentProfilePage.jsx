import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ResumeUpload } from '../../components/common/ResumeUpload';
import './StudentProfilePage.css';

export const StudentProfilePage = () => {
  const { user, updateUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ github: '', linkedin: '', portfolio: '' });
  const [resume, setResume] = useState({ url: '', fileName: '', uploadedAt: null });

  // Array states
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/students/profile/me');
      if (res.data.success) {
        const p = res.data.data;
        setName(p.user?.name || user?.name || '');
        setHeadline(p.headline || '');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setBio(p.bio || '');
        setSkills(p.skills || []);
        setSocialLinks({
          github: p.socialLinks?.github || '',
          linkedin: p.socialLinks?.linkedin || '',
          portfolio: p.socialLinks?.portfolio || ''
        });
        setEducation(p.education || []);
        setExperience(p.experience || []);
        setProjects(p.projects || []);
        setResume(p.resume || { url: '', fileName: '', uploadedAt: null });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim().toLowerCase();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: '', gradeOrCgpa: '' }
    ]);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Project Helpers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: [], liveUrl: '', githubUrl: '' }
    ]);
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        name,
        headline,
        phone,
        location,
        bio,
        skills,
        socialLinks,
        education,
        experience,
        projects
      };

      const res = await api.put('/students/profile', payload);
      if (res.data.success) {
        setSuccessMessage('Profile saved successfully!');
        if (name !== user?.name) {
          updateUserState({ name });
        }
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading your profile..." />;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h1 className="profile-title">Student Profile</h1>
          <p className="profile-subtitle">Keep your academic background, skills, and resume updated for recruiters.</p>
        </div>
        <Button variant="primary" size="md" isLoading={saving} onClick={handleSubmit}>
          Save All Changes
        </Button>
      </div>

      <ErrorMessage message={error} />
      {successMessage && <div className="profile-success-banner">{successMessage}</div>}

      {/* Profile Navigation Tabs */}
      <div className="profile-nav-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'basic' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          👤 Basic Info
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'skills' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          ⚡ Skills & Links
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'education' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          🎓 Education
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'projects' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          💻 Projects
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'resume' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          📄 Resume Document
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <div className="card tab-pane">
            <h3 className="section-title">Personal Overview</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Full Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Headline"
                name="headline"
                placeholder="e.g. Full-Stack Developer | Computer Science Undergrad"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <Input
                label="Phone Number"
                name="phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Location"
                name="location"
                placeholder="e.g. Bangalore, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Professional Summary / Bio</label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Write a brief introduction about your career goals, key strengths, and interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: SKILLS & LINKS */}
        {activeTab === 'skills' && (
          <div className="card tab-pane">
            <h3 className="section-title">Technical Skills</h3>
            <p className="section-desc">These skills drive our smart matching engine when you view job openings.</p>

            <div className="skill-input-wrapper">
              <input
                type="text"
                className="input-field"
                placeholder="Type a skill (e.g. React, Node.js, Python, MongoDB) and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
              />
              <Button variant="secondary" size="md" onClick={handleAddSkill}>
                Add Skill
              </Button>
            </div>

            <div className="skills-badge-list">
              {skills.length === 0 ? (
                <p className="empty-subtext">No skills added yet. Add at least 5 skills to improve matching.</p>
              ) : (
                skills.map((skill) => (
                  <span key={skill} className="skill-chip">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)}>
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <h3 className="section-title" style={{ marginTop: '2rem' }}>Online Presence & Profiles</h3>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="GitHub URL"
                name="github"
                placeholder="https://github.com/username"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
              />
              <Input
                label="LinkedIn URL"
                name="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              />
              <Input
                label="Portfolio URL"
                name="portfolio"
                placeholder="https://yourportfolio.dev"
                value={socialLinks.portfolio}
                onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* TAB 3: EDUCATION */}
        {activeTab === 'education' && (
          <div className="card tab-pane">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h3 className="section-title">Academic History</h3>
                <p className="section-desc">Add your degree, university, and graduation year.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddEducation}>
                + Add Education
              </Button>
            </div>

            {education.length === 0 ? (
              <p className="empty-subtext">No education entries added yet.</p>
            ) : (
              education.map((edu, index) => (
                <div key={index} className="nested-item-card">
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <strong>Entry #{index + 1}</strong>
                    <button
                      type="button"
                      className="delete-link-btn"
                      onClick={() => handleRemoveEducation(index)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Institution / College"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                      required
                    />
                    <Input
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Technology"
                      required
                    />
                    <Input
                      label="Field of Study"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        label="Start Year"
                        type="number"
                        value={edu.startYear}
                        onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                        placeholder="2022"
                      />
                      <Input
                        label="End Year"
                        type="number"
                        value={edu.endYear}
                        onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                        placeholder="2026"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="card tab-pane">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h3 className="section-title">Notable Projects</h3>
                <p className="section-desc">Showcase software products and repositories you have built.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddProject}>
                + Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <p className="empty-subtext">No projects added yet.</p>
            ) : (
              projects.map((proj, index) => (
                <div key={index} className="nested-item-card">
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <strong>Project #{index + 1}</strong>
                    <button
                      type="button"
                      className="delete-link-btn"
                      onClick={() => handleRemoveProject(index)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Project Title"
                      value={proj.title}
                      onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                      placeholder="e.g. E-Commerce Microservices"
                      required
                    />
                    <Input
                      label="GitHub Repository URL"
                      value={proj.githubUrl}
                      onChange={(e) => handleProjectChange(index, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Project Description</label>
                    <textarea
                      className="input-field"
                      rows="3"
                      placeholder="Explain features, architecture, and engineering problems solved..."
                      value={proj.description}
                      onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: RESUME & CLOUD DOCUMENTS */}
        {activeTab === 'resume' && (
          <div className="card tab-pane">
            <h3 className="section-title">Verified Resume Document</h3>
            <p className="section-desc">
              Your resume is stored on encrypted cloud storage and automatically provided to employers when you submit applications.
            </p>
            <ResumeUpload
              resumeData={resume}
              onUploadSuccess={(updatedResume) => {
                setResume(updatedResume);
                setSuccessMessage('Resume synchronized with cloud storage!');
                setTimeout(() => setSuccessMessage(''), 4000);
              }}
            />
          </div>
        )}
      </form>
    </div>
  );
};