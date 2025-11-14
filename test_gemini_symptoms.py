"""Test Gemini API with various symptoms"""
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from llm_service import SymptomAnalyzer

def test_symptom(symptom_text):
    """Test a specific symptom"""
    print(f"\n{'='*70}")
    print(f"Testing: {symptom_text}")
    print('='*70)
    
    analyzer = SymptomAnalyzer()
    result = analyzer.analyze_symptoms(symptom_text, user_id=1)
    
    if result.get('error'):
        print(f"❌ ERROR: {result['error']}")
    else:
        print(f"✅ SUCCESS!")
        print(f"Assessment: {result.get('assessment', 'N/A')[:100]}...")
        print(f"Recommendations: {len(result.get('recommendations', []))} items")
        print(f"Urgency: {result.get('urgency', 'N/A')}")
        print(f"Source: {result.get('source', 'N/A')}")
    
    return result

# Test various symptoms
symptoms = [
    "I have stomach pain",
    "I have tooth ache",
    "I am experiencing hair fall",
    "I have a headache and fever",
    "I have cough and cold",
    "My knee is hurting",
]

print("\n" + "="*70)
print("TESTING GEMINI API WITH VARIOUS SYMPTOMS")
print("="*70)

results = {}
for symptom in symptoms:
    results[symptom] = test_symptom(symptom)

# Summary
print(f"\n{'='*70}")
print("SUMMARY")
print('='*70)
for symptom, result in results.items():
    status = "✅" if not result.get('error') else "❌"
    source = result.get('source', 'error')
    print(f"{status} {symptom[:40]:40} → {source}")

print()
