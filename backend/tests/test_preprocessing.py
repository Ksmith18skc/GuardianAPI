"""
Unit tests for preprocessing functions
"""
import pytest
from app.core.preprocessing import (
    clean_text,
    normalize_text,
    preprocess_text,
    detect_caps_abuse,
    detect_character_repetition
)


class TestTextCleaning:
    """Tests for clean_text function"""
    
    def test_remove_urls(self):
        """Test URL removal"""
        text = "Check this out https://example.com and www.test.org"
        result = clean_text(text)
        assert "https://example.com" not in result
        assert "www.test.org" not in result
    
    def test_remove_mentions(self):
        """Test mention removal"""
        text = "Hey @username how are you?"
        result = clean_text(text)
        assert "@username" not in result
    
    def test_remove_emojis(self):
        """Test emoji removal"""
        text = "Hello 😀 world 🌍"
        result = clean_text(text)
        assert "😀" not in result
        assert "🌍" not in result
    
    def test_normalize_whitespace(self):
        """Test whitespace normalization"""
        text = "This   has    multiple    spaces"
        result = clean_text(text)
        assert "  " not in result  # No double spaces
    
    def test_empty_string(self):
        """Test empty string handling"""
        assert clean_text("") == ""
        assert clean_text("   ") == ""
    
    def test_non_string_input(self):
        """Test non-string input handling"""
        assert clean_text(None) == ""
        assert clean_text(123) == ""


class TestTextNormalization:
    """Tests for normalize_text function"""
    
    def test_lowercase(self):
        """Test lowercase conversion"""
        text = "HELLO WORLD"
        result = normalize_text(text)
        assert result == "hello world"
    
    def test_mixed_case(self):
        """Test mixed case conversion"""
        text = "HeLLo WoRLd"
        result = normalize_text(text)
        assert result == "hello world"


class TestPreprocessingPipeline:
    """Tests for preprocess_text function"""
    
    def test_full_pipeline(self):
        """Test complete preprocessing"""
        text = "Check @user https://example.com HELLO WORLD"
        result = preprocess_text(text)
        assert "@user" not in result
        assert "https://example.com" not in result
        assert result.islower()
    
    def test_without_normalize(self):
        """Test preprocessing without normalization"""
        text = "HELLO @user"
        result = preprocess_text(text, normalize=False)
        assert "@user" not in result
        assert "HELLO" in result  # Case preserved


class TestCapsAbuse:
    """Tests for detect_caps_abuse function"""
    
    def test_caps_abuse_detected(self):
        """Test detection of excessive caps"""
        text = "WHY ARE YOU YELLING AT ME"
        assert detect_caps_abuse(text) is True
    
    def test_normal_caps_not_detected(self):
        """Test normal capitalization not flagged"""
        text = "This is a normal sentence."
        assert detect_caps_abuse(text) is False
    
    def test_mixed_case_not_detected(self):
        """Test mixed case not flagged"""
        text = "This Is A Title Case Sentence"
        assert detect_caps_abuse(text) is False
    
    def test_empty_string(self):
        """Test empty string handling"""
        assert detect_caps_abuse("") is False
    
    def test_custom_threshold(self):
        """Test custom threshold"""
        text = "HELLO"  # 5 uppercase, 5 total = 100%
        assert detect_caps_abuse(text, threshold=0.5) is True
        assert detect_caps_abuse(text, threshold=1.0) is True


class TestCharacterRepetition:
    """Tests for detect_character_repetition function"""
    
    def test_repetition_detected(self):
        """Test detection of character repetition"""
        text = "Nooooooo way"
        assert detect_character_repetition(text) is True
    
    def test_no_repetition(self):
        """Test normal text not flagged"""
        text = "This is normal text"
        assert detect_character_repetition(text) is False
    
    def test_short_repetition_not_detected(self):
        """Test short repetition not flagged"""
        text = "Nooo way"  # Only 3 'o's
        assert detect_character_repetition(text, min_repeats=4) is False
    
    def test_empty_string(self):
        """Test empty string handling"""
        assert detect_character_repetition("") is False
    
    def test_custom_min_repeats(self):
        """Test custom min_repeats parameter"""
        text = "Yessss"  # 4 's's total
        # min_repeats=4 means we need 4 consecutive same characters, which "Yessss" has
        assert detect_character_repetition(text, min_repeats=4) is True
        # min_repeats=5 means we need 5 consecutive same characters, which "Yessss" doesn't have
        assert detect_character_repetition(text, min_repeats=5) is False
        # Test with 5 s's
        text5 = "Yesssss"  # 5 's's
        assert detect_character_repetition(text5, min_repeats=5) is True

