import asyncio
import os
import sys

# Add current directory to sys.path to allow imports from backend
sys.path.append(os.getcwd())

from backend.services.tools_service import ToolsService

async def main():
    print("Testing Video Conversion...")
    service = ToolsService()
    
    try:
        with open("test_video.mp4", "rb") as f:
            content = f.read()
            
        print(f"Read {len(content)} bytes")
        
        result = await service.convert_video(
            file_content=content,
            filename="test_video.mp4",
            target_format="webm"
        )
        
        print("Conversion successful!")
        print(f"Result name: {result['name']}")
        print(f"Result URL length: {len(result['url'])}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
