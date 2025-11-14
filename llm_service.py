"""
LLM Service for Healthcare Symptom Analysis
Uses Google Gemini API (free tier: 15 RPM, 1500 RPD)
"""

import os
import json
import logging
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from typing import Dict, Optional, List
from datetime import datetime, timezone
import sqlite3

logger = logging.getLogger(__name__)


class SymptomAnalyzer:
    """AI-powered symptom analyzer using Google Gemini API"""
    
    def __init__(self):
        self.api_token = os.getenv("GEMINI_API_KEY", "")
        
        if self.api_token:
            try:
                genai.configure(api_key=self.api_token)
                
                # Use Gemini 2.5 Flash - fast, cheap, best for medical analysis
                self.model = genai.GenerativeModel('models/gemini-2.5-flash')
                logger.info(f"Google Gemini API configured successfully with gemini-2.5-flash")
            except Exception as e:
                self.model = None
                logger.error(f"Failed to configure Gemini: {e}")
        else:
            self.model = None
            logger.warning("GEMINI_API_KEY not set. Get free key at: https://makersuite.google.com/app/apikey")
    
    def analyze_symptoms(self, symptoms: str, patient_age: Optional[int] = None, patient_gender: Optional[str] = None, user_id: Optional[int] = None) -> Dict:
        """
        Analyze patient symptoms and return structured health insights
        
        Args:
            symptoms: Patient's symptom description
            patient_age: Optional patient age for context
            patient_gender: Optional patient gender for context
            
        Returns:
            Dict with keys: severity, summary, recommendations, warnings, next_steps
        """
        if not symptoms or not symptoms.strip():
            return self._get_empty_response()
        
        # Force API usage - no fallback
        if not self.api_token or not self.model:
            raise Exception("GEMINI_API_KEY not configured. Get free key at: https://makersuite.google.com/app/apikey")
        
        try:
            # Preprocess symptoms to more clinical phrasing (reduces safety blocks)
            processed_symptoms = self._preprocess_symptoms(symptoms)
            # Build context-aware prompt using processed symptoms
            prompt = self._build_prompt(processed_symptoms, patient_age, patient_gender)
            
            logger.info(f"Calling Google Gemini API")
            
            # Try using list format for safety settings - Gemini API might be version-specific
            # Use BLOCK_ONLY_HIGH to allow most medical content through
            safety_settings = [
                {"category": HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                {"category": HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                {"category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
            ]
            
            # Generate content with relaxed safety settings
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'max_output_tokens': 1000,
                    'top_p': 0.9,
                    'top_k': 40
                },
                safety_settings=safety_settings
            )
            
            logger.info(f"Received response from Gemini API")
            
            # Log full response for debugging
            try:
                logger.info(f"Response candidates: {len(response.candidates) if response.candidates else 0}")
                if response.candidates:
                    logger.info(f"Finish reason: {response.candidates[0].finish_reason}")
                    logger.info(f"Safety ratings: {response.candidates[0].safety_ratings}")
                logger.info(f"Response parts: {response.parts if hasattr(response, 'parts') else 'No parts'}")
            except Exception as debug_err:
                logger.error(f"Debug logging error: {debug_err}")
            
            # Check if response was blocked
            if not response.parts:
                logger.warning(f"Response blocked by safety filters. Finish reason: {response.candidates[0].finish_reason if response.candidates else 'unknown'}")
                self._log_blocked(user_id, symptoms, None, "blocked_no_parts")
                # Automatic single retry with simplified prompt
                retry_prompt = self._build_prompt(self._simplify_for_retry(symptoms), patient_age, patient_gender, simple=True)
                try:
                    retry_response = self.model.generate_content(
                        retry_prompt,
                        generation_config={
                            'temperature': 0.2,
                            'max_output_tokens': 400,
                            'top_p': 0.8,
                            'top_k': 20
                        },
                        safety_settings=[
                            {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_ONLY_HIGH},
                        ]
                    )
                    if retry_response.parts:
                        text_retry = retry_response.text
                        parsed_retry = self._parse_llm_response(text_retry, symptoms)
                        parsed_retry['retried'] = True
                        return self._enrich_local(symptoms, parsed_retry)
                except Exception as retry_err:
                    logger.error(f"Retry failed: {retry_err}")
                # Attempt OpenAI fallback before returning generic fallback
                try:
                    openai_text = self._call_openai(symptoms, simple=True)
                    if openai_text:
                        parsed_openai = self._parse_llm_response(openai_text, symptoms)
                        return self._enrich_local(symptoms, parsed_openai)
                except Exception as oe:
                    logger.error(f"OpenAI fallback after retry failed: {oe}")

                return self._enrich_local(symptoms, self._get_fallback_response(symptoms))
            
            # Get the text response
            response_text = response.text
            
            # Log the full raw response for debugging
            logger.info(f"Raw Gemini response (full): {response_text}")
            
            # Parse JSON response
            analysis = self._parse_llm_response(response_text, symptoms)
            analysis = self._enrich_local(symptoms, analysis)
            logger.info(f"Successfully analyzed symptoms (length: {len(symptoms)})")
            return analysis
            
        except Exception as e:
            logger.error(f"Error during symptom analysis: {e}", exc_info=True)
            raise Exception(f"AI analysis failed: {str(e)}")
    
    def _build_prompt(self, symptoms: str, age: Optional[int], gender: Optional[str], simple: bool = False) -> str:
        """Build a structured prompt for the LLM"""
        context_parts = []
        if age:
            context_parts.append(f"Age: {age}")
        if gender:
            context_parts.append(f"Gender: {gender}")
        
        context_str = ", ".join(context_parts) if context_parts else "No additional context"
        
        # Rephrase prompt to avoid safety triggers - use clinical, educational framing
        if simple:
            # Short, strict JSON schema to reduce token usage and truncation
            return (
                "You are a medical education AI for an Indian telehealth platform. Provide a concise JSON assessment.\n\n"
                f"Input: {symptoms}\n\n"
                "Respond ONLY as JSON with this schema:\n{\n  \"severity\": \"mild|moderate|severe\",\n  \"summary\": \"Under 25 words clinical info\",\n  \"recommendations\": [\"Rec 1\",\"Rec 2\"],\n  \"warnings\": [\"Warn 1\"],\n  \"next_steps\": [\"Step 1\"]\n}\nUse Indian context, Celsius, no extra text."
            )

        prompt = f"""You are a medical education AI providing health information for a telehealth platform in India. 

A patient reports the following for educational consultation purposes:
Patient Context: {context_str}
Patient Report: {symptoms}

As a healthcare information system, provide a clinical assessment in JSON format for the medical team to review.

Respond with ONLY valid JSON in this EXACT format:

{{
  "severity": "mild",
  "summary": "Clinical assessment in 1-2 sentences",
  "recommendations": [
    "Recommendation 1 with specific details",
    "Recommendation 2 with specific details", 
    "Recommendation 3 with specific details",
    "Recommendation 4 with specific details",
    "Recommendation 5 with specific details",
    "Recommendation 6 with specific details"
  ],
  "warnings": [
    "Warning sign 1",
    "Warning sign 2",
    "Warning sign 3"
  ],
  "next_steps": [
    "Next step 1",
    "Next step 2",
    "Next step 3"
  ]
}}

Clinical Guidelines:
- severity: must be "mild", "moderate", or "severe"
- summary: brief medical assessment under 30 words
- recommendations: 5-6 specific healthcare recommendations for Indian context
  * Include common Indian medications when appropriate (Paracetamol/Dolo, antacids, etc.)
  * Mention home care methods suitable for India (steam, warm water, rest, etc.)
  * Consider Indian healthcare infrastructure (PHCs, district hospitals, emergency 108)
- warnings: 3 specific indicators requiring immediate medical attention
- next_steps: 3 specific actions for the patient to take
- Use Celsius for temperatures
- Frame as educational health information, not diagnosis
- Provide only the JSON, no other text"""
        
        return prompt
    
    def _parse_llm_response(self, response_text: str, original_symptoms: str) -> Dict:
        """Parse LLM response into structured format"""
        try:
            # Clean the response text
            response_text = response_text.strip()
            
            # Try to extract JSON from response
            # Handle cases where LLM adds markdown code blocks or extra text
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                if json_end == -1:  # No closing backticks
                    response_text = response_text[json_start:].strip()
                else:
                    response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                if json_end == -1:  # No closing backticks
                    response_text = response_text[json_start:].strip()
                else:
                    response_text = response_text[json_start:json_end].strip()
            
            # Find JSON object boundaries
            if "{" in response_text:
                json_start = response_text.find("{")
                # Find the last complete closing brace
                json_end = response_text.rfind("}")
                if json_end > json_start:
                    response_text = response_text[json_start:json_end + 1]
                else:
                    # Try to close incomplete JSON by adding missing braces
                    open_braces = response_text[json_start:].count("{")
                    close_braces = response_text[json_start:].count("}")
                    if open_braces > close_braces:
                        response_text = response_text[json_start:] + ("}" * (open_braces - close_braces))
                    else:
                        response_text = response_text[json_start:]
            
            # Fix common JSON issues from LLM
            # Remove trailing commas before closing braces/brackets
            import re
            response_text = re.sub(r',(\s*[}\]])', r'\1', response_text)
            
            # Try to fix incomplete strings by closing quotes
            # Count quotes to see if we have unclosed strings
            quote_count = response_text.count('"')
            if quote_count % 2 != 0:  # Odd number of quotes = unclosed string
                # Find last quote and add closing quote before last brace
                last_brace = response_text.rfind("}")
                if last_brace > 0:
                    response_text = response_text[:last_brace] + '"' + response_text[last_brace:]
            
            # Parse JSON
            data = json.loads(response_text)
            
            # Validate required fields
            required_fields = ['severity', 'summary', 'recommendations', 'warnings', 'next_steps']
            for field in required_fields:
                if field not in data:
                    logger.warning(f"Missing field '{field}' in LLM response")
                    parsed = self._get_fallback_response(original_symptoms)
                    return parsed
            
            # Ensure severity is valid and lowercase
            if isinstance(data['severity'], str):
                data['severity'] = data['severity'].lower()
                if data['severity'] not in ['mild', 'moderate', 'severe']:
                    data['severity'] = 'moderate'
            else:
                data['severity'] = 'moderate'
            
            # Ensure lists are actually lists
            for field in ['recommendations', 'warnings', 'next_steps']:
                if not isinstance(data[field], list):
                    data[field] = [str(data[field])]
            
            logger.info(f"Successfully parsed Gemini response: severity={data['severity']}")
            return data
            
        except json.JSONDecodeError as e:
            # Attempt salvage for truncated cardiac/chest pain responses
            salvage_text = response_text
            logger.error(f"Failed to parse LLM JSON response: {e}. Attempting salvage logic.")
            chest_related = any(k in salvage_text.lower() for k in ['chest pain', 'heart paining', 'heart pain'])

            try:
                # If recommendations list opened but not closed, close it
                if '"recommendations": [' in salvage_text and ']' not in salvage_text.split('"recommendations": [', 1)[1]:
                    # Insert closing bracket before final brace
                    last_brace_index = salvage_text.rfind('}')
                    if last_brace_index != -1:
                        salvage_text = salvage_text[:last_brace_index] + ']' + salvage_text[last_brace_index:]

                # Ensure required keys exist; if missing add defaults
                for key in ['warnings', 'next_steps']:
                    if f'"{key}"' not in salvage_text:
                        insertion_point = salvage_text.rfind('}')
                        if insertion_point != -1:
                            default_block = ''
                            if key == 'warnings':
                                default_block = '"warnings": ["Severe persistent chest pain needs immediate medical evaluation","Chest pain with breathlessness or sweating is an emergency","Call 108 for life-threatening symptoms"],'
                            else:
                                default_block = '"next_steps": ["Seek emergency medical assessment (ECG, vitals)","Avoid exertion; remain calm","Arrange transport to nearest hospital"],'
                            salvage_text = salvage_text[:insertion_point] + default_block + salvage_text[insertion_point:]

                # If severity missing but chest related, add severe
                if '"severity"' not in salvage_text and chest_related:
                    insertion_point = salvage_text.find('{') + 1
                    salvage_text = salvage_text[:insertion_point] + '"severity": "severe",' + salvage_text[insertion_point:]

                # If object does not end properly, add closing brace
                open_braces = salvage_text.count('{')
                close_braces = salvage_text.count('}')
                if close_braces < open_braces:
                    salvage_text += '}' * (open_braces - close_braces)

                # Final trailing comma cleanup
                salvage_text = re.sub(r',\s*}', '}', salvage_text)

                data = json.loads(salvage_text)
                logger.info("Salvage successful for truncated LLM response")

                # Normalize fields
                for field in ['recommendations', 'warnings', 'next_steps']:
                    if field not in data or not isinstance(data[field], list):
                        data[field] = []
                if 'summary' not in data:
                    data['summary'] = 'Automated salvage of truncated response. Clinical review advised.'
                if 'severity' not in data:
                    data['severity'] = 'moderate'
                else:
                    data['severity'] = data['severity'].lower()
                if data['severity'] not in ['mild', 'moderate', 'severe']:
                    data['severity'] = 'moderate'
                return data
            except Exception as salvage_err:
                logger.error(f"Salvage failed: {salvage_err}")
                logger.error(f"Original truncated text: {response_text[:800]}")
                self._log_blocked(None, original_symptoms, response_text, "salvage_failed")
                # Try OpenAI fallback if available
                try:
                    openai_text = self._call_openai(original_symptoms, simple=True)
                    if openai_text:
                        parsed = self._parse_llm_response(openai_text, original_symptoms)
                        return self._enrich_local(original_symptoms, parsed)
                except Exception as oe:
                    logger.error(f"OpenAI fallback failed: {oe}")
                return self._enrich_local(original_symptoms, self._get_fallback_response(original_symptoms))
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            return self._enrich_local(original_symptoms, self._get_fallback_response(original_symptoms))

    def _preprocess_symptoms(self, symptoms: str) -> str:
        """Rephrase raw user symptom text into more clinical, structured form to reduce safety blocking."""
        text = symptoms.strip()
        lowered = text.lower()
        if not text:
            return text
        # Cardiac/chest pain phrasing normalisation
        cardiac_terms = ['heart is paining', 'heart pain', 'chest pain', 'chest discomfort', 'crushing pain']
        if any(t in lowered for t in cardiac_terms):
            return (
                f"Patient reports chest discomfort described colloquially as '{text}'. "
                "Duration not specified. No additional associated symptoms provided in raw input. "
                "Provide structured educational clinical assessment (not a diagnosis)."
            )
        # Generic short phrases expansion
        if len(text.split()) <= 3:
            return (
                f"Patient reports: '{text}'. Limited description; expand with likely clinical interpretation and monitoring guidance."
            )
        return text
    
    def _get_empty_response(self) -> Dict:
        """Return empty response for invalid input"""
        return {
            "severity": "unknown",
            "summary": "No symptoms provided for analysis.",
            "recommendations": ["Please describe your symptoms in detail."],
            "warnings": [],
            "next_steps": ["Provide symptom details to receive personalized health guidance."]
        }
    
    def _get_fallback_response(self, symptoms: str) -> Dict:
        """Return fallback response when LLM is unavailable"""
        # Keyword sets for severity classification
        severe_keywords = [
            'chest pain', 'heart pain', 'heart is paining', 'severe pain', 'crushing pain',
            'difficulty breathing', 'shortness of breath', 'blood', 'unconscious', 'seizure'
        ]
        moderate_keywords = [
            'fever', 'pain', 'headache', 'cough', 'vomiting', 'diarrhea', 'nausea', 'body ache'
        ]

        symptoms_lower = symptoms.lower()

        # Determine severity
        if any(keyword in symptoms_lower for keyword in severe_keywords):
            severity = 'severe'
        elif any(keyword in symptoms_lower for keyword in moderate_keywords):
            severity = 'moderate'
        else:
            severity = 'mild'

        # Specialized fallback for cardiac/chest pain scenarios (LLM safety blocks these often)
        cardiac_trigger = any(k in symptoms_lower for k in ['chest pain', 'heart pain', 'heart is paining', 'crushing pain'])
        if cardiac_trigger:
            return {
                "severity": "severe",
                "summary": "Possible cardiac-related chest discomfort reported. Immediate clinical evaluation recommended.",
                "recommendations": [
                    "Stop any physical exertion immediately and rest in a comfortable upright position",
                    "If available and not allergic, chew a 300 mg aspirin (unless previously advised otherwise by a doctor)",
                    "Avoid heavy meals; keep calm and reduce anxiety triggers (slow breathing)",
                    "Arrange rapid transport to the nearest emergency department (call 108 ambulance in India)",
                    "Note onset time, exact nature (pressure, stabbing), radiation (arm, jaw, back) and associated symptoms (sweating, nausea)",
                    "Inform family or caregiver and keep emergency medical records ready"
                ],
                "warnings": [
                    "Severe pressure-like chest pain with sweating or radiating to left arm/jaw is a medical emergency",
                    "Chest pain with shortness of breath, fainting, or confusion requires immediate hospital care",
                    "Do not drive yourself if pain is severe or causing dizziness—call 108"
                ],
                "next_steps": [
                    "Call 108 or reach the nearest emergency facility for ECG evaluation",
                    "Get vitals checked (blood pressure, pulse, oxygen saturation) as soon as possible",
                    "Avoid eating or drinking large amounts until medically assessed"
                ]
            }

        # Generic fallback response (non-cardiac)
        return {
            "severity": severity,
            "summary": "Preliminary automated assessment generated due to AI safety block. Clinical review advised.",
            "recommendations": [
                "Stay hydrated and get adequate rest",
                "Monitor symptom progression with time stamps",
                "Record any new symptoms or changes in severity",
                "Use over-the-counter relief only if previously safe for you",
                "Maintain a light balanced diet (avoid heavy/oily foods if nauseated)",
                "Prepare relevant medical history (medications, allergies) for consultation"
            ],
            "warnings": [
                "Rapid worsening or new severe symptoms need prompt medical help",
                "Persistent high fever (>38.5°C) beyond 48 hours warrants evaluation",
                "Severe dehydration signs (very low urine, dizziness) require attention"
            ],
            "next_steps": [
                "Book a consultation with a verified doctor in the app",
                "Seek in-person care if symptoms do not improve within 24-48 hours",
                "Track vitals if possible (temperature, pulse) and bring notes"
            ]
        }

    def _simplify_for_retry(self, symptoms: str) -> str:
        return f"Clinical summary request for: {symptoms}. Provide concise structured JSON only."

    def _enrich_local(self, original_symptoms: str, data: Dict) -> Dict:
        """Add local rule-based enrichment if recommendations are sparse or generic."""
        lower = original_symptoms.lower()
        recs: List[str] = data.get('recommendations', [])
        # Fever enrichment
        if 'fever' in lower and not any('paracetamol' in r.lower() or 'dolo' in r.lower() for r in recs):
            recs.append("Use Paracetamol (e.g., Dolo 650 mg) every 6-8h as needed (max 4 doses/day) if not contraindicated")
        if 'cough' in lower and not any('steam' in r.lower() for r in recs):
            recs.append("Inhale warm steam 2-3 times/day and maintain hydration")
        if 'headache' in lower and not any('rest' in r.lower() for r in recs):
            recs.append("Ensure regular rest, reduce screen time, and maintain hydration")
        if 'diarrhea' in lower and not any('ors' in r.lower() for r in recs):
            recs.append("Use ORS after each loose stool to prevent dehydration")
        data['recommendations'] = recs[:8]
        return data

    def _call_openai(self, symptoms: str, simple: bool = False) -> Optional[str]:
        """Optional OpenAI fallback: invoke ChatCompletion if OPENAI_API_KEY is set.
        Returns raw text or None on failure.
        """
        try:
            # Import lazily to avoid top-level dependency errors
            import openai
        except Exception:
            logger.info("OpenAI not available")
            return None

        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.info('OPENAI_API_KEY not set')
            return None

        openai.api_key = api_key
        # Build a short prompt similar to our simple JSON schema
        prompt = self._build_prompt(symptoms, None, None, simple=simple) if hasattr(self, '_build_prompt') else symptoms
        try:
            resp = openai.ChatCompletion.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=500
            )
            text = resp.choices[0].message['content']
            logger.info('OpenAI fallback produced a response')
            return text
        except Exception as e:
            logger.error(f'OpenAI call failed: {e}')
            return None

    def _log_blocked(self, user_id: Optional[int], symptoms: str, raw_response: Optional[str], reason: str):
        try:
            db_url = os.getenv('DATABASE_URL', 'sqlite:///medicare.db')
            if db_url.startswith('sqlite:///'):
                path = db_url.replace('sqlite:///','')
                conn = sqlite3.connect(path)
                cur = conn.cursor()
                cur.execute("CREATE TABLE IF NOT EXISTS blocked_ai_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, symptoms TEXT NOT NULL, raw_response TEXT, reason TEXT, model TEXT, created_at TEXT)")
                cur.execute("INSERT INTO blocked_ai_logs (user_id, symptoms, raw_response, reason, model, created_at) VALUES (?,?,?,?,?,?)",
                            (user_id, symptoms, raw_response, reason, 'gemini-2.5-flash', datetime.now(timezone.utc).isoformat()))
                conn.commit()
                conn.close()
                logger.info("Blocked AI response logged")
        except Exception as log_err:
            logger.error(f"Failed to log blocked AI response: {log_err}")


# Global instance
_analyzer = None


def get_symptom_analyzer() -> SymptomAnalyzer:
    """Get or create global SymptomAnalyzer instance"""
    global _analyzer
    if _analyzer is None:
        _analyzer = SymptomAnalyzer()
    return _analyzer
