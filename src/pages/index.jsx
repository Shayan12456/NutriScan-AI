import { useState, useEffect } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false); // State to control popup visibility
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return;
    // FormData allows you to send data from the client to the server easily without needing any external packages
    // commonly used when you need to send data from a form, especially when uploading files.
    // FormData is for the client side to format the data for upload
    let formData = new FormData();
    formData.append('file', file);
    //(name of the field, actual file object obtained from an <input type="file">)
    setLoading(true);

  // Upload file via API route
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();//json response back to js

    if (res.ok) {
      setResponse(data.response);
      setPopupVisible(true); // Open the popup on successful response
    } else {
      setResponse(data.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    // This script will run after the component mounts
    const fileInput = document.getElementById("actual-btn");
    const fileLabel = document.getElementById("file-chosen");

    fileInput.addEventListener("change", function() {
      // Check if a file is selected
      fileLabel.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : "No file chosen"; // Set label to file name
    });

    // Cleanup event listener on unmount
    return () => {
      fileInput.removeEventListener("change", () => {});
    };
  }, []);

  return (
    <div className='container'>
       <h1>NutriScan AI</h1>
       <p><i>Scan Your Food, Transform Your Health!</i></p>
       <br /><br />
      <form method='POST' action='/upload' onSubmit={handleSubmit}>
        <input type="file" id='actual-btn'  onChange={handleFileChange} accept="image/*" hidden/>
        <label htmlFor="actual-btn">Choose File</label>
        <br /><br />
        <span id="file-chosen">No file chosen</span>
        <br /><br /><br />
        <button type="submit">Upload</button>
      </form>

      {loading && <p>Scanning your package...</p>}
      {popupVisible && (
        <div id="myPopup" className="popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => {setPopupVisible(false);}}>X</button>
            <p dangerouslySetInnerHTML={{ __html: response }} />
          </div>
        </div>
      )}

      <style jsx>{`
        .popup {
          display: flex; /* Make popup visible */
          position: fixed;
          color: black;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7); /* Black background with opacity */
          justify-content: center;
          align-items: center;
        }

        /* Popup content */
        .popup-content {
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          width: 150vw;
          text-align: center;
          position: relative;
          opacity: 1;
          transform: scale(0.5);
          transition: all 0.3s ease;
          font-size: 1.5rem;
        }

        /* Close button */
        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: red;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 50%;
          padding: 5px 10px;
        }

        /* Show the popup with animation */
        .popup.show .popup-content {
          opacity: 1;
          transform: scale(1);
        }

        .popup-content p {
          width: 130vw !important;
        }

        /* Style the button to trigger popup */
        .popup-btn {
          padding: 10px 20px;
          background-color: #ff6a00;
          color: #fff;
          border: none;
          cursor: pointer;
          border-radius: 10px;
        }

        @media(max-width: 932px) and (max-height: 430px) {
          .popup-content {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
