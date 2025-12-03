"""
Basic usage example for Guardian API Python SDK
"""
from guardian_api import GuardianClient, GuardianAPIError

def main():
    # Initialize client
    client = GuardianClient(base_url="http://localhost:8000")
    
    print("=== Guardian API Python SDK Example ===\n")
    
    # Check health
    print("1. Checking API health...")
    try:
        health = client.health_check()
        print(f"   Status: {health['status']}")
        print(f"   Version: {health['version']}")
        print(f"   Models loaded: {health['models_loaded']}\n")
    except GuardianAPIError as e:
        print(f"   Error: {e}\n")
        return
    
    # Get model info
    print("2. Getting model information...")
    try:
        models = client.get_models()
        for model in models['models']:
            status = "✓" if model['loaded'] else "✗"
            print(f"   {status} {model['name']} (v{model['version']})")
        print()
    except GuardianAPIError as e:
        print(f"   Error: {e}\n")
    
    # Moderate single text
    print("3. Moderating single text...")
    test_texts = [
        "This is a completely normal and harmless message.",
        "Women are terrible at coding and should stick to cooking.",
        "You're an idiot and I hope you fail at everything."
    ]
    
    for text in test_texts:
        try:
            result = client.moderate_text(text)
            score = result['ensemble']['score']
            severity = result['ensemble']['severity']
            primary_issue = result['ensemble']['primary_issue']
            
            print(f"   Text: {text[:50]}...")
            print(f"   Score: {score:.3f} | Severity: {severity} | Issue: {primary_issue}")
            print(f"   Summary: {result['ensemble']['summary']}")
            print()
        except GuardianAPIError as e:
            print(f"   Error: {e}\n")
    
    # Batch moderation
    print("4. Batch moderation...")
    try:
        batch_result = client.moderate_batch(test_texts)
        print(f"   Processed: {batch_result['total_processed']} texts")
        print(f"   Time: {batch_result['processing_time_ms']}ms")
        print()
        
        for i, result in enumerate(batch_result['results']):
            print(f"   Text {i+1}: Score {result['ensemble']['score']:.3f}")
    except GuardianAPIError as e:
        print(f"   Error: {e}\n")
    
    # Context manager usage
    print("5. Using context manager...")
    with GuardianClient(base_url="http://localhost:8000") as client:
        result = client.moderate_text("Test message")
        print(f"   Score: {result['ensemble']['score']:.3f}\n")

if __name__ == "__main__":
    main()

