"""
Text preprocessing pipeline for Guardian API
"""
import re
import string
from typing import List
import emoji


def clean_text(text: str) -> str:
    """
    Clean text by removing URLs, mentions, and excessive whitespace
    
    Args:
        text: Raw input text
        
    Returns:
        Cleaned text string
    """
    if not isinstance(text, str):
        return ""
    
    # Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    
    # Remove mentions (@username)
    text = re.sub(r'@\w+', '', text)
    
    # Remove emojis (optional - can be kept for context)
    text = emoji.replace_emoji(text, replace='')
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def normalize_text(text: str) -> str:
    """
    Normalize text: lowercase and basic normalization
    
    Args:
        text: Input text
        
    Returns:
        Normalized text
    """
    text = text.lower()
    return text


def preprocess_text(text: str, normalize: bool = True) -> str:
    """
    Complete preprocessing pipeline
    
    Args:
        text: Raw input text
        normalize: Whether to lowercase the text
        
    Returns:
        Preprocessed text ready for model inference
    """
    cleaned = clean_text(text)
    if normalize:
        cleaned = normalize_text(cleaned)
    return cleaned


def detect_caps_abuse(text: str, threshold: float = 0.7) -> bool:
    """
    Detect if text is using excessive capitalization (yelling)
    
    Args:
        text: Input text
        threshold: Ratio of uppercase to total letters to consider abuse
        
    Returns:
        True if caps abuse detected
    """
    if not text:
        return False
    
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return False
    
    uppercase_count = sum(1 for c in letters if c.isupper())
    ratio = uppercase_count / len(letters)
    
    return ratio >= threshold


def detect_character_repetition(text: str, min_repeats: int = 4) -> bool:
    """
    Detect excessive character repetition (e.g., "noooooo")
    
    Args:
        text: Input text
        min_repeats: Minimum consecutive repeats to flag (total characters needed)
        
    Returns:
        True if excessive repetition detected
    """
    if not text:
        return False
    
    # Pattern: any character followed by that same character (min_repeats-1) or more times
    # This means we need min_repeats total characters
    # Example: min_repeats=4 means we need 4 consecutive same characters
    # Pattern (.)\1{3,} matches: 1 original + 3+ repeats = 4+ total
    pattern = rf'(.)\1{{{min_repeats-1},}}'
    return bool(re.search(pattern, text))

