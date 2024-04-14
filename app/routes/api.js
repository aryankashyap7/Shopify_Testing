import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint to handle Facebook OAuth callback
router.get('/facebook-oauth', async (req, res) => {
    const { code } = req.query; // Extract the authorization code from the query parameters

    // Handle authorization code exchange and token fetching
    try {
        const accessToken = await fetchAccessToken(code);
        const userInfo = await fetchUserInfo(accessToken);
        res.json({ success: true, userInfo });
    } catch (error) {
        console.error('Error handling Facebook OAuth:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to fetch access token using the authorization code
const fetchAccessToken = async (code) => {
    const tokenExchangeUrl = 'https://graph.facebook.com/v10.0/oauth/access_token';
    const params = {
        client_id: 'YOUR_FACEBOOK_APP_ID',
        client_secret: 'YOUR_FACEBOOK_APP_SECRET',
        redirect_uri: 'YOUR_REDIRECT_URI',
        code,
    };

    const response = await axios.get(tokenExchangeUrl, { params });
    return response.data.access_token;
};

// Function to fetch user information using the access token
const fetchUserInfo = async (accessToken) => {
    const userInfoUrl = `https://graph.facebook.com/me?fields=name,email&access_token=${accessToken}`;
    const response = await axios.get(userInfoUrl);
    return response.data;
};

export default router;
