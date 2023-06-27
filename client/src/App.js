import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 



function App() {









  
  const [accessToken, setAccessToken] = useState('');

  const [driveData, setDriveData] = useState([]);


  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);

    const token = urlParams.get('accessToken');

    if (token) {

      setAccessToken(token);

    }
  }, []);

  const handleLinkDrive = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error(error);
    }
  };

  const handleRevokeAccess = async () => {
    try {
      await axios.post('http://localhost:5000/api/revoke', { accessToken });
      setAccessToken('');
      setDriveData([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetDriveData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDriveData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">

      <h1>Google Drive Analytics</h1>


      {accessToken ? (

        <div>
          <button className="primary-button" onClick={handleGetDriveData}>
                             Get Drive Data
          </button>
          <button className="secondary-button" onClick={handleRevokeAccess}>
                             Revoke Access

          </button>

          {driveData.length > 0 ? (

            <div className="drive-data-container">

              <h2>Drive Data:</h2>

              <table className="drive-data-table">
                <thead>

                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Link</th>
                  </tr>

                </thead>

                <tbody>

                  {driveData.map((file, index) => (
                    <tr key={index}>
                      <td>{file.name}</td>
                      <td>{file.mimeType}</td>
                      <td>{file.size}</td>
                      <td>
                        <a href={file.webViewLink} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
                  No drive data available.
                  
                  </p>
          )}
        </div>
      ) : (
        <button className="primary-button" onClick={handleLinkDrive}>

          Link Google Drive


        </button>
      )}
    </div>
  );
}

export default App;
