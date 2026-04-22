import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


async def upload_image(file: UploadFile, folder: str = "futo-marketplace") -> str:
    """Upload a single image to Cloudinary. Returns the secure URL."""

    # Validate type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: JPG, PNG, WEBP"
        )

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image"
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


async def upload_multiple_images(files: list[UploadFile], folder: str = "futo-marketplace") -> list[str]:
    """Upload multiple images. Returns list of secure URLs."""
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images per listing")

    urls = []
    for file in files:
        url = await upload_image(file, folder)
        urls.append(url)
    return urls


def delete_image(public_id: str):
    """Delete an image from Cloudinary by public_id."""
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass  # Non-critical — don't crash if delete fails