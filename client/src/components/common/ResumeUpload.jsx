import { useState, useRef } from 'react';
import api from '../../services/api';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import './ResumeUpload.css';

export const ResumeUpload = ({ resumeData, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large! Maximum permitted size is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      setError('');
      const res = await api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        onUploadSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your uploaded resume?')) return;

    try {
      setDeleting(true);
      setError('');
      const res = await api.delete('/upload/resume');
      if (res.data.success) {
        onUploadSuccess({ url: '', fileName: '', uploadedAt: null });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadResume = async () => {
    const downloadWindow = window.open('', '_blank');

    try {
      setError('');
      const res = await api.get('/upload/resume/download');
      if (res.data.success) {
        if (downloadWindow) {
          downloadWindow.location.replace(res.data.data.url);
        } else {
          window.location.assign(res.data.data.url);
        }
      }
    } catch (err) {
      downloadWindow?.close();
      setError(err.response?.data?.message || 'Unable to download your resume. Please try again.');
    }
  };

  return (
    <div className="resume-upload-wrapper">
      <ErrorMessage message={error} />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
      />

      {resumeData?.url ? (
        <div className="resume-active-card">
          <div className="resume-doc-icon">📄</div>
          <div className="resume-meta-info">
            <strong className="resume-name">{resumeData.fileName || 'Verified_Student_Resume.pdf'}</strong>
            <span className="resume-date">
              Uploaded on {resumeData.uploadedAt ? new Date(resumeData.uploadedAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
          <div className="resume-actions-group">
            <Button variant="outline" size="sm" onClick={handleDownloadResume}>
              View / Download ↗
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleDeleteResume}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="resume-dropzone" onClick={() => fileInputRef.current?.click()}>
          <div className="dropzone-icon">📤</div>
          <strong>{uploading ? 'Streaming to Cloud Storage...' : 'Click or Drag Resume to Upload'}</strong>
          <p>Supported Formats: PDF, DOC, DOCX (Max 5MB)</p>
          <Button variant="primary" size="sm" isLoading={uploading} style={{ marginTop: '0.75rem' }}>
            Select PDF Document
          </Button>
        </div>
      )}
    </div>
  );
};
