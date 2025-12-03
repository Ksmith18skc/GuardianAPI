"""
Model 3: Rule-Based Heuristics Engine
"""
import re
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import logging

from app.config import settings
from app.core.preprocessing import preprocess_text, detect_caps_abuse, detect_character_repetition

logger = logging.getLogger(__name__)


class RuleEngine:
    """Rule-based heuristics for content moderation"""
    
    def __init__(self):
        self.slur_list: List[str] = []
        self.threat_patterns: List[re.Pattern] = []
        self.self_harm_phrases: List[str] = []
        self.profanity_list: List[str] = []
        self.model_version: str = "rules_v1"
        self.loaded: bool = False
    
    def load_rules(self, rules_dir: Optional[Path] = None) -> bool:
        """
        Load rule lists from JSON files
        
        Args:
            rules_dir: Directory containing rule JSON files
            
        Returns:
            True if loaded successfully
        """
        try:
            if rules_dir is None:
                rules_dir = settings.RULES_DIR
            
            # Load slurs
            slurs_path = rules_dir / "slurs.json"
            if slurs_path.exists():
                with open(slurs_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.slur_list = data.get("slurs", [])
            else:
                self._load_default_slurs()
            
            # Load threat patterns
            threats_path = rules_dir / "threats.json"
            if threats_path.exists():
                with open(threats_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    patterns = data.get("patterns", [])
                    self.threat_patterns = [re.compile(p, re.IGNORECASE) for p in patterns]
            else:
                self._load_default_threat_patterns()
            
            # Load self-harm phrases
            self_harm_path = rules_dir / "self_harm.json"
            if self_harm_path.exists():
                with open(self_harm_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.self_harm_phrases = data.get("phrases", [])
            else:
                self._load_default_self_harm()
            
            # Load profanity
            profanity_path = rules_dir / "profanity.json"
            if profanity_path.exists():
                with open(profanity_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.profanity_list = data.get("profanity", [])
            else:
                self._load_default_profanity()
            
            self.loaded = True
            logger.info("Rule engine loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading rules: {e}")
            # Load defaults on error
            self._load_defaults()
            return False
    
    def _load_defaults(self):
        """Load default rule lists"""
        self._load_default_slurs()
        self._load_default_threat_patterns()
        self._load_default_self_harm()
        self._load_default_profanity()
        self.loaded = True
    
    def _load_default_slurs(self):
        """Load default slur list (placeholder - should be comprehensive)"""
        # Note: In production, this should be a comprehensive, maintained list
        self.slur_list = [
            # Add comprehensive slur list here
            # This is a placeholder
        ]
    
    def _load_default_threat_patterns(self):
        """Load default threat detection patterns"""
        self.threat_patterns = [
            re.compile(r'\b(kill|murder|destroy|harm|hurt)\s+(you|them|him|her|yourself)', re.IGNORECASE),
            re.compile(r'\b(i\s+will|i\'ll|i\'m\s+going\s+to)\s+(kill|hurt|harm|attack)', re.IGNORECASE),
            re.compile(r'\b(die|death|dead)\s+(to|for|wish)', re.IGNORECASE),
            re.compile(r'\b(bomb|explosive|weapon|gun|shoot)', re.IGNORECASE),
        ]
    
    def _load_default_self_harm(self):
        """Load default self-harm phrases"""
        self.self_harm_phrases = [
            "kill myself",
            "end my life",
            "commit suicide",
            "hurt myself",
            "cut myself",
            "want to die",
            "better off dead",
            "no reason to live"
        ]
    
    def _load_default_profanity(self):
        """Load default profanity list (common words)"""
        # Note: In production, use a comprehensive profanity list
        self.profanity_list = [
            # Add comprehensive profanity list
            # This is a placeholder
        ]
    
    def check_slurs(self, text: str) -> bool:
        """Check if text contains slurs"""
        text_lower = text.lower()
        for slur in self.slur_list:
            if slur.lower() in text_lower:
                return True
        return False
    
    def check_threats(self, text: str) -> bool:
        """Check if text contains threat patterns"""
        for pattern in self.threat_patterns:
            if pattern.search(text):
                return True
        return False
    
    def check_self_harm(self, text: str) -> bool:
        """Check if text contains self-harm phrases"""
        text_lower = text.lower()
        for phrase in self.self_harm_phrases:
            if phrase.lower() in text_lower:
                return True
        return False
    
    def check_profanity(self, text: str) -> bool:
        """Check if text contains profanity"""
        text_lower = text.lower()
        for word in self.profanity_list:
            if word.lower() in text_lower:
                return True
        return False
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Run all rule checks on text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with rule flags
        """
        if not self.loaded:
            self._load_defaults()
        
        # Preprocess for rule checking (keep original for some checks)
        processed_text = preprocess_text(text, normalize=False)
        
        result = {
            "slur_detected": self.check_slurs(processed_text),
            "threat_detected": self.check_threats(processed_text),
            "self_harm_flag": self.check_self_harm(processed_text),
            "profanity_flag": self.check_profanity(processed_text),
            "caps_abuse": detect_caps_abuse(text),
            "character_repetition": detect_character_repetition(text),
            "model_version": self.model_version
        }
        
        return result


# Global instance
rule_engine = RuleEngine()

