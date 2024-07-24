import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../src/assets/convertedFiles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ConvertedFiles = () => {
  const [files, setFiles] = useState([]);
  const [editingFilename, setEditingFilename] = useState(null);
  const [newFilename, setNewFilename] = useState('');
  const fileRefs = useRef({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/auth/files', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFiles(response.data.files);
        setError(null);
      }catch (err) {
        console.error('Error fetching files:', err);
        if (err.response) {
          if (err.response.status === 404) {
            setError('No files found for the current user.');
          } else if (err.response.status === 500) {
            setError('Failed to fetch files. Please try again later.');
          } else {
            setError('An unexpected error occurred.');
          }
        } else {
          setError('No response from server. Please check your connection.');
        }
      }
    };

    fetchFiles();
  }, []);
  const handleEditClick = (file) => {
    setEditingFilename(file.filename);
    setNewFilename(file.filename);
    if (fileRefs.current[file.filename]) {
      fileRefs.current[file.filename].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFilenameChange = (e) => {
    setNewFilename(e.target.value);
  };

  const handleSaveClick = async (file) => {
    try {
      const token = sessionStorage.getItem('authToken');
      await axios.put(
<<<<<<< HEAD
        `http://localhost:3000/auth/updatefiles/${file.filename}`,
=======
        `file-convertor-api.vercel.app/auth/updatefiles/${file.filename}`,
>>>>>>> parent of ed79d1d (Update ConvertedFiles.jsx)
        { newFilename },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFiles(files.map(f => f.filename === file.filename ? { ...f, filename: newFilename } : f));
      setEditingFilename(null);
      setError(null);
    } catch (err) {
      console.error('Error updating filename:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('File not found or not authorized.');
        } else if (err.response.status === 402) {
          setError('File not found.');
        } else if (err.response.status === 500) {
          setError('Error updating filename. Please try again later.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('No response from server. Please check your connection.');
      }
    }
  };

  const handleCancelClick = () => {
    setEditingFilename(null);
    setNewFilename('');
  };

  const handleDeleteClick = async (file) => {
    try {
      const token = sessionStorage.getItem('authToken');
<<<<<<< HEAD
      await axios.delete(`http://localhost:3000/auth/delete/${file.filename}`, {
=======
      await axios.delete(`file-convertor-api.vercel.app/auth/delete/${file.filename}`, {
>>>>>>> parent of ed79d1d (Update ConvertedFiles.jsx)
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(files.filter(f => f.filename !== file.filename));
      setError(null);
    } catch (err) {
      console.error('Error deleting file:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('File not found or not authorized.');
        } else if (err.response.status === 404) {
          setError('File not found.');
        } else if (err.response.status === 500) {
          setError('Error deleting file. Please try again later.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('No response from server. Please check your connection.');
      }
    }
  };


  return (
    <div className="converted-files">
      <h1>Converted Files</h1>
      {files.length > 0 ? (
        <ul>
          {files.map((file) => (
            <li key={file.filename} ref={(el) => (fileRefs.current[file.filename] = el)}>
              <p><strong>Original Name:</strong> {file.originalname}</p>
              <p>
                <strong>Filename:</strong>
                {editingFilename === file.filename ? (
                  <>
                    <input
                      type="text"
                      value={newFilename}
                      onChange={handleFilenameChange}
                    />
                    <button onClick={() => handleSaveClick(file)}>Save</button>
                    <button onClick={handleCancelClick}>Cancel</button>
                  </>
                ) : (
                  file.filename
                )}
              </p>
              <p><strong>Content Type:</strong> {file.contentType}</p>
              <p><strong>Size:</strong> {file.size} bytes</p>
              <p><strong>Format:</strong> {file.format}</p>
              <div>
                <a href={`http://localhost:3000/auth/download/${file.filename}`} target="_blank" rel="noopener noreferrer">
                  View File
                </a>
                <a href="#" onClick={() => handleDeleteClick(file)}>Delete</a>
                {editingFilename !== file.filename && (
                  <a href="#" onClick={() => handleEditClick(file)}>Edit</a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
};

export default ConvertedFiles;
