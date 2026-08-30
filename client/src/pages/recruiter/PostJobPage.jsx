import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './PostJobPage.css';

export const PostJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    experienceLevel: 'Fresher / Entry-Level',
    location: '',
    openings: 1,
    minSalary: '',
    maxSalary: '',
    deadline: '',
    description: '',
    skillsRequired: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim().toLowerCase();
    if (trimmed && !formData.skillsRequired.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, trimmed]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.deadline) {
      setError('Please fill in all mandatory job details.');
      return;
    }

    if (formData.skillsRequired.length === 0) {
      setError('Please add at least one required skill tag.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: formData.title,
        jobType: formData.jobType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        openings: Number(formData.openings) || 1,
        salary: {
          min: Number(formData.minSalary) || 0,
          max: Number(formData.maxSalary) || 0,
          currency: 'INR'
        },
        deadline: formData.deadline,
        description: formData.description,
        skillsRequired: formData.skillsRequired
      };

      const res = await api.post('/jobs', payload);
      if (res.data.success) {
        navigate('/recruiter/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish job opening.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-header">
        <h1 className="post-job-title">Create Job Posting</h1>
        <p className="post-job-subtitle">
          Publish a new role to find candidates tailored to your tech stack.
        </p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="card post-job-form">
        <h3 className="section-heading">1. Role & Placement Overview</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Job Role Title"
            name="title"
            placeholder="e.g. Associate Software Engineer (Backend)"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <Input
            label="Location"
            name="location"
            placeholder="e.g. Bangalore, India (or Remote)"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="input-group">
            <label className="input-label">Job Type</label>
            <select
              name="jobType"
              className="input-field"
              value={formData.jobType}
              onChange={handleChange}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Work Mode</label>
            <select
              name="workMode"
              className="input-field"
              value={formData.workMode}
              onChange={handleChange}
            >
              <option>On-site</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Experience Tier</label>
            <select
              name="experienceLevel"
              className="input-field"
              value={formData.experienceLevel}
              onChange={handleChange}
            >
              <option>Fresher / Entry-Level</option>
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Total Vacancies"
            name="openings"
            type="number"
            min="1"
            value={formData.openings}
            onChange={handleChange}
            required
          />
          <Input
            label="Min Salary (INR / Annum)"
            name="minSalary"
            type="number"
            placeholder="e.g. 600000"
            value={formData.minSalary}
            onChange={handleChange}
          />
          <Input
            label="Max Salary (INR / Annum)"
            name="maxSalary"
            type="number"
            placeholder="e.g. 1000000"
            value={formData.maxSalary}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Application Deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleChange}
          required
        />

        <h3 className="section-heading" style={{ marginTop: '1.5rem' }}>
          2. Required Technical Skills
        </h3>
        <div className="skill-input-wrapper">
          <input
            type="text"
            className="input-field"
            placeholder="Type a required skill (e.g. react, node.js, docker) and press Add"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
          />
          <Button variant="secondary" onClick={handleAddSkill}>
            Add Skill
          </Button>
        </div>

        <div className="skills-badge-list" style={{ marginBottom: '1.5rem' }}>
          {formData.skillsRequired.length === 0 ? (
            <span className="empty-subtext">No required skills specified yet.</span>
          ) : (
            formData.skillsRequired.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)}>
                  &times;
                </button>
              </span>
            ))
          )}
        </div>

        <h3 className="section-heading">3. Detailed Job Description</h3>
        <div className="input-group">
          <label className="input-label">
            Role Responsibilities & Scope <span className="input-required">*</span>
          </label>
          <textarea
            name="description"
            className="input-field"
            rows="6"
            placeholder="Outline daily duties, tech stack expectations, growth opportunities, and interview process..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions-row">
          <Button
            variant="outline"
            onClick={() => navigate('/recruiter/jobs')}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Publish Job Listing
          </Button>
        </div>
      </form>
    </div>
  );
};