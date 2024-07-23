import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../src/assets/FileConversion.css';

const FileConvert = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file || !format) {
      setError('Please select a file and a format.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
      const response = await axios.post('https://file-convertor-api.vercel.app/auth/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message) {
        setSuccess(response.data.message);
      } else {
        setError('Conversion failed. Please try again.');
      }
    } catch (err) {
      console.error('Error converting file:', err);
      if (err.response) {
        const status = err.response.status;
        if (status === 400) {
          setError('No file uploaded');
        } else if (status === 402) {
          setError('Free plan allows up to 10 conversions');
        } else if (status === 403) {
          setError('Basic plan only allows document and image conversions');
        } else if (status === 404) {
          setError('Basic plan allows up to 20 conversions per month');
        } else if (status === 405) {
          setError('Unsupported conversion format');
        } else if (status === 500) {
          setError('Failed to convert file');
        } else {
          setError('Error converting file. Please try again.');
        }
      } else {
        setError('Error converting file. Please try again.');
      }
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Convert File</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="file">File:</label>
                <input
                  type="file"
                  className="form-control"
                  id="file"
                  onChange={handleFileChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="format">Format:</label>
                <select
                  id="format"
                  className="form-control"
                  value={format}
                  onChange={handleFormatChange}
                >
                  <option value="">Select a format</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="mp3">MP3</option>
                  <option value="mp4">MP4</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Convert</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileConvert;
