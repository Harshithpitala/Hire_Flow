import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './AdminRecruitersPage.css';

export const AdminRecruitersPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [filterVerified, setFilterVerified] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [filterVerified]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterVerified !== '') params.isVerified = filterVerified;

      const res = await api.get('/admin/companies', { params });
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (companyId) => {
    try {
      setActionId(companyId);
      const res = await api.patch(`/admin/companies/${companyId}/verify`);
      if (res.data.success) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === companyId ? { ...c, isVerified: res.data.data.isVerified } : c))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle company verification.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="admin-recruiter-container">
      <div className="admin-recruiter-header">
        <div>
          <h1 className="admin-recruiter-title">Recruiter & Company Approvals</h1>
          <p className="admin-recruiter-subtitle">
            Verify employer authenticity, corporate domains, and grant verified hiring badges.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="admin-filter-bar card">
        <div className="admin-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${filterVerified === '' ? 'active' : ''}`}
            onClick={() => setFilterVerified('')}
          >
            All Companies
          </button>
          <button
            type="button"
            className={`role-tab-btn ${filterVerified === 'false' ? 'active' : ''}`}
            onClick={() => setFilterVerified('false')}
          >
            ⏳ Pending Verification
          </button>
          <button
            type="button"
            className={`role-tab-btn ${filterVerified === 'true' ? 'active' : ''}`}
            onClick={() => setFilterVerified('true')}
          >
            ✓ Verified Employers
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading employer organizations..." />
      ) : companies.length === 0 ? (
        <EmptyState title="No companies found" description="No registered organizations match the current filter." />
      ) : (
        <div className="card table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Industry & Size</th>
                <th>Headquarters</th>
                <th>Registered By</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="company-cell">
                      <strong>{c.name}</strong>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer" className="company-url">
                          {c.website}
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="industry-text">{c.industry}</span>
                    <span className="size-text">{c.companySize} employees</span>
                  </td>
                  <td>📍 {c.headquarters}</td>
                  <td>
                    <div className="registered-by-cell">
                      <span>{c.createdBy?.name || 'Recruiter'}</span>
                      <small>{c.createdBy?.email}</small>
                    </div>
                  </td>
                  <td>
                    <Badge variant={c.isVerified ? 'success' : 'warning'} size="sm">
                      {c.isVerified ? '✓ Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant={c.isVerified ? 'outline' : 'primary'}
                      size="sm"
                      isLoading={actionId === c._id}
                      onClick={() => handleToggleVerification(c._id)}
                    >
                      {c.isVerified ? 'Revoke' : 'Approve & Verify'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};