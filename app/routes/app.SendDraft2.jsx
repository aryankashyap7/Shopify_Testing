import React, { useState } from 'react';

function MyComponent() {
    const [responseData, setResponseData] = useState(null);

    const postData = async () => {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }) // Sample data
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setResponseData(data);
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error occurred:', error);
        }
    };

    return (
        <div>
            <button onClick={postData}>Send POST Request</button>
            {responseData && (
                <div>
                    <h2>Response Received:</h2>
                    <pre>{JSON.stringify(responseData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default MyComponent;
