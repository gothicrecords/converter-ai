"""
Test script to debug JPG to PDF conversion
"""
import requests
from io import BytesIO
from PIL import Image

# Create a simple test image
img = Image.new('RGB', (100, 100), color='red')
img_buffer = BytesIO()
img.save(img_buffer, format='JPEG')
img_buffer.seek(0)

# Send to backend
url = "http://localhost:3000/api/pdf/jpg-to-pdf"
files = {'files': ('test.jpg', img_buffer, 'image/jpeg')}

print(f"Testing: {url}")
print(f"Sending test image...")

try:
    response = requests.post(url, files=files, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response Body: {response.text[:500]}")
    
    if response.status_code == 200:
        print("✅ SUCCESS - PDF conversion worked!")
        data = response.json()
        print(f"Result: {data.get('name', 'N/A')}")
    else:
        print("❌ ERROR - PDF conversion failed")
        
except Exception as e:
    print(f"❌ EXCEPTION: {e}")
