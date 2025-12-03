"""
Advanced usage example for Guardian API Python SDK
"""
from guardian_api import GuardianClient, GuardianAPIError, GuardianAPIException
import json

def analyze_result(result):
    """Helper function to analyze moderation result"""
    ensemble = result['ensemble']
    label = result['label']
    
    print(f"  Overall Score: {ensemble['score']:.3f}")
    print(f"  Severity: {ensemble['severity']}")
    print(f"  Primary Issue: {ensemble['primary_issue']}")
    print(f"  Summary: {ensemble['summary']}")
    print()
    print("  Model Breakdown:")
    print(f"    Sexism: {label['sexism']['score']:.3f} (threshold met: {label['sexism'].get('threshold_met', False)})")
    print(f"    Toxicity: {label['toxicity']['overall']:.3f}")
    print(f"      - Insult: {label['toxicity']['insult']:.3f}")
    print(f"      - Threat: {label['toxicity']['threat']:.3f}")
    print(f"      - Identity Attack: {label['toxicity']['identity_attack']:.3f}")
    print(f"      - Profanity: {label['toxicity']['profanity']:.3f}")
    print()
    print("  Rule Flags:")
    rules = label['rules']
    flags = []
    if rules['slur_detected']:
        flags.append("Slur")
    if rules['threat_detected']:
        flags.append("Threat")
    if rules['self_harm_flag']:
        flags.append("Self-Harm")
    if rules['profanity_flag']:
        flags.append("Profanity")
    if rules['caps_abuse']:
        flags.append("Caps Abuse")
    if rules['character_repetition']:
        flags.append("Character Repetition")
    
    if flags:
        print(f"    {' | '.join(flags)}")
    else:
        print("    None")
    print()
    print(f"  Processing Time: {result['meta']['processing_time_ms']}ms")
    print(f"  Models Used: {', '.join(result['meta']['models_used'])}")
    print()

def main():
    client = GuardianClient(base_url="http://localhost:8000")
    
    print("=== Advanced Guardian API Usage ===\n")
    
    # Wait for API to be ready
    print("Waiting for API to be ready...")
    max_retries = 10
    for i in range(max_retries):
        if client.is_healthy():
            print("✓ API is ready!\n")
            break
        if i < max_retries - 1:
            print(f"  Retry {i+1}/{max_retries}...")
            import time
            time.sleep(1)
    else:
        print("✗ API is not ready. Please check if the server is running.\n")
        return
    
    # Analyze different types of content
    test_cases = [
        {
            "name": "Clean Text",
            "text": "This is a completely normal and professional message."
        },
        {
            "name": "Sexist Content",
            "text": "Women are terrible at their jobs and should quit immediately."
        },
        {
            "name": "Toxic Content",
            "text": "You're a complete moron and I hate everything about you."
        },
        {
            "name": "Threat",
            "text": "I will find you and make you suffer for what you did."
        },
        {
            "name": "Self-Harm",
            "text": "I want to kill myself and end it all right now."
        },
        {
            "name": "Caps Abuse",
            "text": "WHY ARE YOU YELLING AT ME LIKE THIS"
        },
        {
            "name": "Character Repetition",
            "text": "Nooooooo way this is happening"
        }
    ]
    
    for case in test_cases:
        print(f"=== {case['name']} ===")
        print(f"Text: {case['text']}")
        print()
        
        try:
            result = client.moderate_text(case['text'])
            analyze_result(result)
        except GuardianAPIError as e:
            print(f"  API Error: {e} (Status: {e.status_code})\n")
        except GuardianAPIException as e:
            print(f"  Network Error: {e}\n")
        except Exception as e:
            print(f"  Unexpected Error: {e}\n")
    
    # Batch processing with error handling
    print("=== Batch Processing ===")
    texts = [
        "Normal message",
        "Harmful content here",
        "Another test message"
    ]
    
    try:
        batch_result = client.moderate_batch(texts)
        print(f"Total processed: {batch_result['total_processed']}")
        print(f"Total time: {batch_result['processing_time_ms']}ms")
        print()
        
        for i, result in enumerate(batch_result['results']):
            print(f"Result {i+1}:")
            print(f"  Score: {result['ensemble']['score']:.3f}")
            print(f"  Severity: {result['ensemble']['severity']}")
            print()
    except GuardianAPIError as e:
        print(f"Error: {e}\n")
    
    # Export results to JSON
    print("=== Exporting Results ===")
    try:
        result = client.moderate_text("Test export")
        with open("moderation_result.json", "w") as f:
            json.dump(result, f, indent=2)
        print("Results exported to moderation_result.json")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

