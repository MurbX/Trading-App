# Quick Start Guide

## Step-by-Step Setup

### 1. Get API Keys

#### MongoDB Atlas (Free)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

#### Alpha Vantage API (Free)
1. Go to https://www.alphavantage.co/support/#api-key
2. Enter your email and get your free API key
3. Copy the API key

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your credentials
# - Add your MongoDB connection string
# - Add your Alpha Vantage API key
# - Change JWT_SECRET to a random string

# Start the server
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
🌍 Environment: development
✅ MongoDB connected successfully
```

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Expected output:
```
Compiled successfully!
You can now view trading-bot-frontend in the browser.
Local: http://localhost:3000
```

### 4. Test the Application

1. Open http://localhost:3000
2. Click "Sign up" to create an account
3. Fill in your details and create an account
4. You'll be redirected to the dashboard
5. Select a forex pair (e.g., EUR/USD)
6. Wait a few seconds for the signal to load
7. View the trading signal and chart!

## Common Issues

### Backend won't start
- Check if MongoDB URI is correct
- Make sure port 5000 is not in use
- Verify all environment variables are set

### Frontend shows connection errors
- Make sure backend is running on port 5000
- Check browser console for specific errors
- Verify proxy setting in frontend/package.json

### "API call frequency limit"
- Alpha Vantage free tier allows 5 calls per minute
- Wait 1 minute before refreshing
- Each forex pair selection makes an API call

## Next Steps

- Try different forex pairs
- Toggle between light and dark themes
- Test the password reset functionality
- Explore the EMA indicators on the chart
- Check different time periods for patterns

## Development Tips

### Backend Development
- Server auto-restarts on changes (nodemon)
- Check terminal for error logs
- Test API endpoints with Postman or curl

### Frontend Development
- Hot reload enabled (auto-refresh on save)
- React DevTools browser extension recommended
- Check browser console for errors

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Secure MongoDB with IP whitelist
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up email service for password resets
- [ ] Consider API response caching
- [ ] Monitor API rate limits
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure environment-specific URLs

Enjoy trading! 📈
