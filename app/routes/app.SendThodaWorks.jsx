import React, { useState } from 'react';
import { Page, Card, FormLayout, Button, TextField } from '@shopify/polaris';

function DataSenderPage() {
    // State to hold form data
    const [pixelId, setPixelId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [draftOrders, setDraftOrders] = useState('');

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way

        // Create data object to send
        const data = {
            pixelId,
            accessToken,
            draftOrders,
        };

        // Log the data being sent
        console.log('Sending data:', data);

        try {
            // Send POST request
            const response = await fetch('https://webhook.site/e6717bc6-8846-4b8c-90ab-fd0353541bbd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'no-cors', // Enable CORS mode
            });

            // Log the response status
            console.log('Response status:', response.status);

            // Check the response status
            if (!response.ok) {
                const responseBody = await response.text();
                console.error(`Failed to send data. Status: ${response.status}. Response body: ${responseBody}`);
                alert(`Failed to send data. Status: ${response.status}. Check the console for more details.`);
            } else {
                // Success response handling
                console.log('Data sent successfully');
                alert('Data sent successfully!');
            }
        } catch (error) {
            // Log any other errors
            console.error('Error:', error);
            alert(`An error occurred while sending data: ${error.message}. Check the console for more details.`);
        }
    };

    return (
        <Page title="Data Sender Page">
            <Card sectioned>
                <form onSubmit={handleSubmit}>
                    <FormLayout>
                        <TextField
                            label="Pixel ID"
                            value={pixelId}
                            onChange={setPixelId}
                            required
                        />
                        <TextField
                            label="Access Token"
                            value={accessToken}
                            onChange={setAccessToken}
                            required
                        />
                        <TextField
                            label="Draft Orders"
                            value={draftOrders}
                            onChange={setDraftOrders}
                            multiline
                            required
                        />
                        <Button submit primary>Send Data</Button>
                    </FormLayout>
                </form>
            </Card>
        </Page>
    );
}

export default DataSenderPage;
