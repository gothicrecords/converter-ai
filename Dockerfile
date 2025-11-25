# Use Python 3.12 slim image
FROM python:3.12-slim

# Install system dependencies including Fortran compiler
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gfortran \
    gcc \
    g++ \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Run the application (Railway sets PORT env var)
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level info

