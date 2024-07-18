import  { useState } from 'react';
import axios from 'axios';
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
      const response = await axios.post('http://localhost:3000/auth/convert', formData, {
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
      setError('Error converting file. Please try again.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Convert File</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>File:</label>
            <input type="file" onChange={handleFileChange} />
          </div>
          <div>
            <label>Format:</label>
            <select value={format} onChange={handleFormatChange}>
              <option value="">Select a format</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="mp3">MP3</option>
              <option value="mp4">MP4</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>
          <button type="submit">Convert</button>
        </form>
      </div>
    </div>
  );
};

export default FileConvert;
