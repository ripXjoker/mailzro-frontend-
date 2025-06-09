// frontend/src/components/EmailCleaner.js
import React, { useState } from 'react';
import axios from 'axios'; // Make sure you have axios installed (npm install axios)

function EmailCleaner() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleDeleteAllEmails = async () => {
        // Double-check with the user before proceeding
        if (!window.confirm("WARNING: This will attempt to move ALL your Gmail messages to trash. This action cannot be easily undone and may take a long time for many emails. Are you absolutely sure?")) {
            return; // User cancelled
        }
        // A second confirmation for safety
        if (!window.confirm("FINAL CONFIRMATION: Are you REALLY sure you want to proceed with trashing ALL your Gmails?")) {
            return; // User cancelled again
        }

        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            // Send a POST request to your new backend endpoint
            const response = await axios.post('http://localhost:5000/api/v2/gmail/delete-all-messages', {}, { withCredentials: true });
            setMessage(response.data.message);
            console.log('Deletion successful:', response.data);
            // Optionally, you might want to refresh the UI or redirect here
        } catch (err) {
            console.error('Deletion error:', err);
            if (err.response) {
                // If the server responded with an error (e.g., 401, 500)
                setError(err.response.data.error || 'An unexpected error occurred during deletion.');
            } else {
                // Network error (server not reachable)
                setError('Network error or server unreachable. Please check your backend is running.');
            }
        } finally {
            setIsLoading(false); // Stop loading regardless of success or error
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#dc3545' }}>Gmail Cleaner: Delete All Messages</h2>
            <p style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', padding: '15px', borderRadius: '5px', color: '#856404' }}>
                <strong style={{ color: '#721c24' }}>EXTREME WARNING:</strong> This function will attempt to move <strong>ALL</strong> your Gmail messages to the trash. This action is irreversible once messages are permanently deleted from trash (after about 30 days). Please use with extreme caution.
            </p>

            <button
                onClick={handleDeleteAllEmails}
                disabled={isLoading} // Disable button while the process is ongoing
                style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    backgroundColor: '#dc3545', // Red color for delete
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                }}
            >
                {isLoading ? 'Processing all your emails...' : 'DELETE ALL MY GMAIL MESSAGES'}
            </button>

            {isLoading && <p style={{ color: '#007bff', marginTop: '20px' }}>
                <span role="img" aria-label="loading">⏳</span> Processing deletion... This may take a while if you have many emails. Please do not close this page.
            </p>}
            {message && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '20px' }}>{message}</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '20px' }}>Error: {error}</p>}
        </div>
    );
}

export default EmailCleaner;