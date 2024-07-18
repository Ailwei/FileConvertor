import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const ConvertedFiles = () => {
  const [files, setFiles] = useState([]);
  const [editingFilename, setEditingFilename] = useState(null);
  const [newFilename, setNewFilename] = useState('');
  const fileRefs = useRef({});

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
      } catch (err) {
        console.error('Error fetching files:', err);
        setFiles([]);
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
        `http://localhost:3000/auth/updatefiles/${file.filename}`,
        { newFilename },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFiles(files.map(f => f.filename === file.filename ? { ...f, filename: newFilename } : f));
      setEditingFilename(null);
    } catch (err) {
      console.error('Error updating filename:', err);
    }
  };

  const handleCancelClick = () => {
    setEditingFilename(null);
    setNewFilename('');
  };

  const handleDeleteClick = async (file) => {
    try {
      const token = sessionStorage.getItem('authToken');
      await axios.delete(`http://localhost:3000/auth/delete/${file.filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(files.filter(f => f.filename !== file.filename));
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  return (
    <div>
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
                      style={{ marginLeft: '10px', width: '150px' }}
                    />
                    <button onClick={() => handleSaveClick(file)} style={{ marginLeft: '5px' }}>Save</button>
                    <button onClick={handleCancelClick} style={{ marginLeft: '5px' }}>Cancel</button>
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
                <a href="#" onClick={() => handleDeleteClick(file)} style={{ marginRight: '10px' }}>Delete</a>
                {editingFilename !== file.filename && (
                  <a href="#" onClick={() => handleEditClick(file)} style={{ marginRight: '10px' }}>Edit</a>
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
