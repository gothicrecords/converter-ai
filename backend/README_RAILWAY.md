# Railway Deployment Guide for FastAPI Backend

## 1. Prerequisites
- Ensure your backend code is in the `backend/` folder
- Confirm `requirements.txt`, `Procfile`, and `.env.example` are present
- Push your code to a GitHub repository

## 2. Railway Setup
1. Go to [Railway](https://railway.app/)
2. Create a new project and link your GitHub repo
3. Set up environment variables in Railway using `.env.example` as a reference
4. Railway will auto-detect the `Procfile` and install dependencies from `requirements.txt`

## 3. External Binaries
- Railway provides Tesseract and FFmpeg at `/usr/bin/tesseract` and `/usr/bin/ffmpeg`
- Set these paths in your environment variables

## 4. Start the Backend
- Railway will run: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

## 5. Update Frontend
- Use the Railway backend URL in production (update your API URL logic)

## 6. Troubleshooting
- Check Railway build logs for errors
- Ensure all required environment variables are set
- For issues with Tesseract/FFmpeg, verify the paths

---
For more help, see Railway docs: https://docs.railway.app/
