import React, { useState, useEffect } from 'react';
import { Page, Card, Button, Text } from '@shopify/polaris';

function createFacebookOAuthUrl() {
  const clientId = '437086108711179';
  const redirectUri = encodeURIComponent('https://easyinsights.ai/ei-internal');
  const scope = encodeURIComponent('ads_read,ads_management'); // Specify the required scopes

  // Build and return the OAuth URL
  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
}

function AccountConnectionExample({ serviceName }) {
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    const oauthUrl = createFacebookOAuthUrl();

    // Open a popup window for the Facebook OAuth flow
    const width = 800; // Changed width to 800
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Open a new popup window for the OAuth flow
    const popup = window.open(oauthUrl, 'FacebookOAuthPopup', `width=${width},height=${height},left=${left},top=${top}`);

    // Listen for messages from the popup window
    const handleOAuthCode = (event) => {
      // Verify the message origin
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, code } = event.data;

      // If the message contains the authorization code, handle it
      if (type === 'FacebookOAuthCode' && code) {
        // Close the popup window
        if (popup) popup.close();

        // Handle the authorization code: request access and refresh tokens
        fetchAccessToken(code);
      }
    };

    // Add event listener to receive messages from the popup window
    window.addEventListener('message', handleOAuthCode);
  };

  const fetchAccessToken = async (code) => {
    setLoading(true);

    try {
      // Make a request to your server to exchange the authorization code for access and refresh tokens
      const response = await fetch('/api/token-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use the access token to fetch user information
        const { accessToken } = data;
        fetchUserInfo(accessToken);
      } else {
        // Handle error (e.g., show an error message)
        console.error('Failed to exchange authorization code for tokens:', data);
      }
    } catch (error) {
      console.error('Failed to fetch access token:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (accessToken) => {
    try {
      // Make a request to the Facebook Graph API to fetch user information
      const response = await fetch(`https://graph.facebook.com/me?fields=name&access_token=${accessToken}`);
      const data = await response.json();

      if (response.ok) {
        // Update the state with the user information
        setUserName(data.name);
        setConnected(true);
      } else {
        console.error('Failed to fetch user information:', data);
      }
    } catch (error) {
      console.error('Failed to fetch user information:', error);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setUserName('');
  };

  return (
    <Card sectioned>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2><strong>{serviceName}</strong></h2>
          <Text>{connected ? `Connected as ${userName}` : 'No account connected'}</Text>
        </div>
        <div>
          {connected ? (
            <Button onClick={handleDisconnect} destructive>
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} primary disabled={loading}>
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Index() {
  return (
    <Page title="Connect your Account" breadcrumbs={[{ content: 'Home', url: '/' }]}>
      <Card sectioned>
        <Text>Connect to Facebook using the options below.</Text>
      </Card>
      <Card sectioned>
        <Text as="h2" variant="headingMd">Connect your Account</Text>
        <br />
        <AccountConnectionExample serviceName="Facebook" />
      </Card>
    </Page>
  );
}
