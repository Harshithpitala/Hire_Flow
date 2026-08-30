import { useState, useEffect } from 'react';
import api from '../../services/api';
import { JobCard } from '../../components/cards/JobCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import './JobsPage.css';

export const JobsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobTypes, setJobTypes] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [sort, setSort] = useState('newest');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, [page, sort]);

  useEffect(() => {
    const fetchBookmarkIds = async () => {
      if (!isAuthenticated || user?.role !== 'student') {
        setBookmarkedJobIds([]);
        return;
      }

      try {
        const res = await api.get('/bookmarks/ids');
        if (res.data.success) setBookmarkedJobIds(res.data.data);
      } catch {
        // Jobs remain available even when saved-job state cannot be retrieved.
        setBookmarkedJobIds([]);
      }
    };

    fetchBookmarkIds();
  }, [isAuthenticated, user?.role]);

  const handleBookmarkChange = (jobId, isSaved) => {
    setBookmarkedJobIds((currentIds) =>
      isSaved
        ? [...new Set([...currentIds, jobId])]
        : currentIds.filter((id) => id !== jobId)
    );
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: 8,
        sort
      };

      if (search) params.search = search;
      if (location) params.location = location;
      if (jobTypes.length > 0) params.jobType = jobTypes.join(',');
      if (workModes.length > 0) params.workMode = workModes.join(',');
      if (experienceLevels.length > 0) params.experienceLevel = experienceLevels.join(',');

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalResults(res.data.pagination.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const toggleFilter = (setter, currentList, value) => {
    if (currentList.includes(value)) {
      setter(currentList.filter((item) => item !== value));
    } else {
      setter([...currentList, value]);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setJobTypes([]);
    setWorkModes([]);
    setExperienceLevels([]);
    setSort('newest');
    setPage(1);
    setTimeout(fetchJobs, 0);
  };

  return (
    <div className="jobs-page-container container">
      {/* Search Header Bar */}
      <div className="jobs-search-bar card">
        <form onSubmit={handleSearchSubmit} className="search-inputs-grid">
          <Input
            placeholder="Search by job title, skill (e.g. React, Python), or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input-field"
          />
          <Input
            placeholder="City, State, or Remote..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input-field"
          />
          <Button type="submit" variant="primary" size="md">
            Find Jobs
          </Button>
        </form>
      </div>

      <div className="jobs-body-layout">
        {/* Left Filter Sidebar */}
        <aside className="jobs-filter-sidebar card">
          <div className="flex justify-between items-center filter-head">
            <h3>Filters</h3>
            <button type="button" className="reset-btn" onClick={handleResetFilters}>
              Reset all
            </button>
          </div>

          {/* Job Type */}
          <div className="filter-group">
            <label className="filter-title">Job Type</label>
            {['Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => (
              <label key={type} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={jobTypes.includes(type)}
                  onChange={() => toggleFilter(setJobTypes, jobTypes, type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>

          {/* Work Mode */}
          <div className="filter-group">
            <label className="filter-title">Work Mode</label>
            {['On-site', 'Hybrid', 'Remote'].map((mode) => (
              <label key={mode} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={workModes.includes(mode)}
                  onChange={() => toggleFilter(setWorkModes, workModes, mode)}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>

          {/* Experience Tier */}
          <div className="filter-group">
            <label className="filter-title">Experience Level</label>
            {['Fresher / Entry-Level', '1-3 Years', '3-5 Years', '5+ Years'].map((lvl) => (
              <label key={lvl} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={experienceLevels.includes(lvl)}
                  onChange={() => toggleFilter(setExperienceLevels, experienceLevels, lvl)}
                />
                <span>{lvl}</span>
              </label>
            ))}
          </div>

          <Button variant="secondary" size="md" className="btn-full" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </aside>

        {/* Right Job Results Feed */}
        <main className="jobs-feed-area">
          <div className="jobs-feed-header">
            <span className="results-count">
              Showing <strong>{totalResults}</strong> open opportunities
            </span>

            <div className="sort-selector">
              <label>Sort by:</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          <ErrorMessage message={error} />

          {loading ? (
            <Loader message="Scanning active job listings..." />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No matching roles found"
              description="Try broadening your search keywords or clearing facet filters."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isBookmarkedInitial={bookmarkedJobIds.includes(job._id)}
                    onBookmarkChange={handleBookmarkChange}
                  />
                ))}
              </div>

              {/* Pagination Controller */}
              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="page-indicator">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
