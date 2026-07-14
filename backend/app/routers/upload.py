import uuid
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("")
async def upload_image(file: UploadFile = File(...)):
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase credentials not configured."
        )

    # Generate a unique file name
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    file_name = f"{uuid.uuid4()}.{file_extension}"
    
    # Read file content
    contents = await file.read()
    
    bucket_name = "complaint-images"
    
    # Supabase Storage REST API URL
    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{file_name}"
    
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_KEY}",
        "Content-Type": file.content_type or "application/octet-stream"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, content=contents, headers=headers)
        
        if response.status_code != 200:
            print("Supabase upload error:", response.text)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image to storage: {response.text}"
            )
            
    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_name}"

    return {"success": True, "url": public_url, "type": file.content_type}
