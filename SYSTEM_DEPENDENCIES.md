# System Dependencies for Railway/Docker

The following system packages are required for the backend to function correctly:

## Core
- `ffmpeg`: Required for audio/video conversion (ffmpeg-python)

## OpenCV (Image Processing)
- `libgl1`: Required by opencv-python
- `libglib2.0-0`: Required by opencv-python

## WeasyPrint (PDF Generation)
- `libpango-1.0-0`: Text rendering
- `libpangoft2-1.0-0`: Text rendering
- `libjpeg-dev`: JPEG handling
- `libopenjp2-7-dev`: JPEG 2000 handling
- `libffi-dev`: Foreign Function Interface

## Scientific Computing
- `gfortran`, `gcc`, `g++`: Compilers
- `libopenblas-dev`, `liblapack-dev`: Linear algebra libraries for numpy/scipy

These are installed via `apt-get` in the `Dockerfile`.
