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
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libjpeg-dev \
    libopenjp2-7-dev \
    libffi-dev \
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

# Crea directory per logs
RUN mkdir -p /app/logs

# Run the application (Railway sets PORT env var)
# Usa lo script di produzione per workers multipli e ottimizzazioni
CMD python start_backend_production.py

