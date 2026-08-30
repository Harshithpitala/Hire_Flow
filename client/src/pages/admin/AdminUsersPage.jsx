import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './AdminUsersPage.css';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      setActionId(userId);
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.data.isActive } : u))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle user status.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <div>
          <h1 className="admin-users-title">User Account Directory</h1>
          <p className="admin-users-subtitle">
            Manage student candidates, verified recruiters, and platform administrators.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="admin-filter-bar card">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <Input
            placeholder="Search by full name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          <Button variant="primary" type="submit">Search</Button>
        </form>

        <div className="admin-role-tabs">
          {[
            { label: 'All Users', val: '' },
            { label: 'Students', val: 'student' },
            { label: 'Recruiters', val: 'recruiter' },
            { label: 'Admins', val: 'admin' }
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              className={`role-tab-btn ${roleFilter === tab.val ? 'active' : ''}`}
              onClick={() => setRoleFilter(tab.val)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader message="Loading platform users..." />
      ) : users.length === 0 ? (
        <EmptyState title="No matching users found" description="Try modifying your search query or role filter." />
      ) : (
        <div className="card table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info-cell">
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'recruiter' ? 'info' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td>
                    <span className="date-text">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.role !== 'admin' && (
                      <Button
                        variant={u.isActive ? 'danger' : 'outline'}
                        size="sm"
                        isLoading={actionId === u._id}
                        onClick={() => handleToggleUserStatus(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    )}
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