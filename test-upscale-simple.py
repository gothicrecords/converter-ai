import requests
import os

# Find a test image
test_image = None
for root, dirs, files in os.walk('uploads'):
    for file in files:
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            test_image = os.path.join(root, file)
            break
    if test_image:
        break

if not test_image:
    print("No test image found in uploads folder")
    exit(1)

print(f"Using test image: {test_image}")

# Test the upscale endpoint
url = "http://localhost:8000/api/tools/upscale"

with open(test_image, 'rb') as f:
    files = {'image': f}
    
    print("Sending request to", url)
    response = requests.post(url, files=files)
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
