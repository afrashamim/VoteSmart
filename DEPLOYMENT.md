# VoteSmart Deployment Guide

This guide will help you deploy your VoteSmart application to various platforms.

## Prerequisites

1. **Git repository** - Your code should be in a Git repository
2. **MongoDB Atlas account** - For cloud database (free tier available)
3. **Node.js** - Version 16 or higher

## Option 1: Heroku Deployment (Recommended)

### Backend Deployment

1. **Create Heroku account** at [heroku.com](https://heroku.com)

2. **Install Heroku CLI** and login:
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   cd votesmart-backend
   heroku create your-votesmart-backend
   ```

4. **Set up MongoDB Atlas**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster
   - Get connection string
   - Add to Heroku config vars:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   heroku config:set JWT_SECRET="your_secret_key_here"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy backend**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```

### Frontend Deployment

1. **Create another Heroku app**:
   ```bash
   cd ../votesmart-frontend
   heroku create your-votesmart-frontend
   ```

2. **Set environment variable**:
   ```bash
   heroku config:set REACT_APP_API_URL="https://your-votesmart-backend.herokuapp.com"
   ```

3. **Deploy frontend**:
   ```bash
   git add .
   git commit -m "Prepare frontend for deployment"
   git push heroku main
   ```

## Option 2: Vercel Deployment (Frontend) + Railway (Backend)

### Backend on Railway

1. **Go to [railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Select the `votesmart-backend` folder**
4. **Add environment variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production

### Frontend on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Set root directory to `votesmart-frontend`**
4. **Add environment variable**:
   - `REACT_APP_API_URL`: Your Railway backend URL

## Option 3: Render Deployment

### Backend on Render

1. **Go to [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Set build command**: `npm install`
5. **Set start command**: `npm start`
6. **Add environment variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production

### Frontend on Render

1. **Create new Static Site**
2. **Set build command**: `npm run build`
3. **Set publish directory**: `build`
4. **Add environment variable**:
   - `REACT_APP_API_URL`: Your backend URL

## Environment Variables Setup

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/votesmart
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## Database Setup

1. **MongoDB Atlas** (Recommended):
   - Create free cluster
   - Get connection string
   - Replace `username`, `password`, and `cluster` with your values

2. **Local MongoDB** (Development only):
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:27017/votesmart`

## Post-Deployment Checklist

1. ✅ Backend is accessible via HTTPS
2. ✅ Frontend can connect to backend
3. ✅ Database is connected and working
4. ✅ Admin can log in and manage nominees
5. ✅ Users can register and vote
6. ✅ File uploads work correctly
7. ✅ JWT authentication is working

## Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure backend CORS is configured for your frontend domain
2. **Database connection**: Check MongoDB Atlas IP whitelist
3. **File uploads**: Ensure uploads directory exists and is writable
4. **Environment variables**: Double-check all variables are set correctly

### Debug Commands:

```bash
# Check backend logs
heroku logs --tail

# Check environment variables
heroku config

# Test database connection
heroku run node -e "console.log(process.env.MONGODB_URI)"
```

## Security Considerations

1. **Use strong JWT secrets**
2. **Enable HTTPS everywhere**
3. **Set up proper CORS**
4. **Use environment variables for secrets**
5. **Regular security updates**

## Cost Estimation

- **Heroku**: Free tier available, paid plans start at $7/month
- **Vercel**: Free tier available, paid plans start at $20/month
- **Railway**: Free tier available, paid plans start at $5/month
- **Render**: Free tier available, paid plans start at $7/month
- **MongoDB Atlas**: Free tier available, paid plans start at $9/month

## Support

If you encounter issues during deployment, check:
1. Platform-specific documentation
2. Application logs
3. Environment variable configuration
4. Database connection settings 