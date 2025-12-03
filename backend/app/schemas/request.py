"""
Request schemas for Guardian API
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional


class TextModerationRequest(BaseModel):
    """Request schema for single text moderation"""
    text: str = Field(..., description="Text to moderate", min_length=1, max_length=10000)
    
    @validator('text')
    def text_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Text cannot be empty")
        return v.strip()


class BatchModerationRequest(BaseModel):
    """Request schema for batch text moderation"""
    texts: List[str] = Field(..., description="List of texts to moderate", min_items=1, max_items=100)
    
    @validator('texts')
    def texts_valid(cls, v):
        if not v:
            raise ValueError("Texts list cannot be empty")
        if len(v) > 100:
            raise ValueError("Maximum 100 texts per batch")
        for text in v:
            if not text or not text.strip():
                raise ValueError("All texts must be non-empty")
            if len(text) > 10000:
                raise ValueError("Each text must be under 10000 characters")
        return [t.strip() for t in v]

