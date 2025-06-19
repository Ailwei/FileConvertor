import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import jwtDecode from 'jwt-decode';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const ConvertedFiles = () => {
  const [files, setFiles] = useState([]);
  const [editingFilename, setEditingFilename] = useState(null);
  const [newFilename, setNewFilename] = useState('');
  const fileRefs = useRef({});
  const [storage, setStorage] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/auth/files', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFiles(response.data.files || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Error fetching files. Please try again later.');
        setFiles([]);
      }
    };

    const fetchStorage = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`http://localhost:3000/auth/update-storage/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStorage(response.data || {});
        setError(null);
      } catch (error) {
        console.error('Error fetching storage details:', error);
        setError('Error fetching storage details. Please try again later.');
        setStorage({});
      }
    };

    fetchFiles();
    fetchStorage();
  }, []);

  const indexOfLastFile = currentPage * itemsPerPage;
  const indexOfFirstFile = indexOfLastFile - itemsPerPage;
  const currentFiles = files.slice(indexOfFirstFile, indexOfLastFile);

  const totalPages = Math.ceil(files.length / itemsPerPage);

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
      setError(null);
    } catch (err) {
      console.error('Error updating filename:', err);
      setError('Error updating filename. Please try again later.');
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
      setError(null);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Error deleting file. Please try again later.');
    }
  };

  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56'];

  const pieData = [
    { name: 'Used Storage', value: parseFloat(storage.usedStorage) || 0 },
    { name: 'Remaining Storage', value: parseFloat(storage.remainingStorage) || 0 },
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
   <div className="row">
  {/* Storage Details */}
  <div className="col-md-6 mb-4">
    <div className="card h-100">
      <div className="card-header">
        <h4 className="mb-0">Storage Details</h4>
      </div>
      <div className="card-body">
        {storage.allocatedStorage ? (
          <div style={{ width: '100%', height: 300 }}>
            <PieChart width={300} height={250}>
              <Pie
                data={pieData}
                cx={150}
                cy={120}
                innerRadius={50}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        ) : (
          <p>No storage data available.</p>
        )}
      </div>
    </div>
  </div>

  {/* Converted Files */}
  <div className="col-md-6 mb-4">
    <div className="card h-100">
      <div className="card-header">
        <h4 className="mb-0">Converted Files</h4>
      </div>
      <div className="card-body">
        {currentFiles.length > 0 ? (
          <ul className="list-group">
            {currentFiles.map((file) => (
              <li
                key={file.filename}
                ref={(el) => (fileRefs.current[file.filename] = el)}
                className="list-group-item"
              >
                <p>
                  <strong>Filename:</strong>{' '}
                  {editingFilename === file.filename ? (
                    <>
                      <input
                        type="text"
                        value={newFilename}
                        onChange={handleFilenameChange}
                      />
                      <button
                        onClick={() => handleSaveClick(file)}
                        className="btn btn-primary btn-sm ms-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="btn btn-secondary btn-sm ms-2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    file.filename
                  )}
                </p>
                <p>
                  <strong>Format:</strong> {file.format}
                </p>
                <div>
                  <a
                    href={`http://localhost:3000/auth/download/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-info btn-sm me-2"
                  >
                    View File
                  </a>
                  <button
                    onClick={() => handleDeleteClick(file)}
                    className="btn btn-danger btn-sm me-2"
                  >
                    Delete
                  </button>
                  {editingFilename !== file.filename && (
                    <button
                      onClick={() => handleEditClick(file)}
                      className="btn btn-warning btn-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No converted files found.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination mt-3">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {[...Array(totalPages).keys()].map((pageNumber) => (
                <li
                  key={pageNumber + 1}
                  className={`page-item ${currentPage === pageNumber + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => handlePageChange(pageNumber + 1)}>
                    {pageNumber + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  </div>
</div>
  );
}

export default ConvertedFiles;
