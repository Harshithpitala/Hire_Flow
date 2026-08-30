import { useState, useEffect } from 'react';
import api from '../../services/api';
import { JobCard } from '../../components/cards/JobCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const SavedJobsPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookmarks/my');
      if (res.data?.data) {
        setBookmarks(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkChange = (jobId, isSaved) => {
    if (!isSaved) {
      setBookmarks((prev) => prev.filter((b) => b.job?._id !== jobId));
    }
  };

  if (loading) return <Loader text="Loading your saved jobs..." />;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Saved Jobs 🔖</h1>
        <p className="text-muted">Review positions you have bookmarked for later application.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {bookmarks.length === 0 ? (
        <EmptyState
          title="No saved jobs found"
          description="Browse active listings and click the bookmark icon to save jobs here."
          actionText="Browse Jobs"
          actionLink="/jobs"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {bookmarks.map((b) => (
            b.job && (
              <JobCard
                key={b._id}
                job={b.job}
                isBookmarkedInitial={true}
                onBookmarkChange={handleBookmarkChange}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};