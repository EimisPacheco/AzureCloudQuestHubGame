import logging
import azure.functions as func
import openai
import json
import os
import random
from typing import Dict, List, TypedDict

class AzureService(TypedDict):
    name: str
    description: str


SERVICE_DEFINITIONS = {
  "Batch AI": "Provides AI workload orchestration with batch processing capabilities",
  "Computer Vision": "Analyzes visual content in images and videos to extract information",
  "Custom Vision": "Customizes image recognition to identify specific content in pictures",
  "Face APIs": "Detects, recognizes, and analyzes human faces in images",
  "Content Moderators": "Detects potentially offensive or unwanted content",
  "Personalizers": "Delivers personalized user experiences through reinforcement learning",
  "Speech Services": "Converts speech to text and text to speech with natural sounding voices",
  "QnA Makers": "Creates conversational question-answer layers over your data",
  "Translator Text": "Provides real-time text translation across multiple languages",
  "Language Understanding": "Applies custom machine-learning intelligence to natural language text",
  "Azure OpenAI": "Provides access to OpenAI's powerful language models with Azure security",
  "Cognitive Search": "AI-powered cloud search service for mobile and web app development",
  "Cognitive Services": "Adds AI capabilities to applications through pre-built APIs",
  "Bot Services": "Intelligent, serverless bot service that scales on demand",

  "Virtual Machine": "Provides on-demand, scalable computing resources",
  "Kubernetes Services": "Simplifies deploying, managing, and scaling containerized applications",
  "Availability Sets": "Ensures VMs are distributed across multiple isolated hardware nodes",
  "Disks Snapshots": "Point-in-time copies of Azure managed disks",
  "Azure Functions": "Event-driven, serverless compute service",
  "Batch Accounts": "Runs large-scale parallel and high-performance computing applications"}

def generate_random_services() -> List[AzureService]:
    openai.api_key = os.environ['OPENAI_API_KEY']
    
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert in Azure cloud services. Generate a JSON object containing 20 random Azure service names as keys and their definitions as values. The definitions should be concise and describe the purpose and functionality of each service."""
                },
                {
                    "role": "user",
                    "content": "Generate a JSON object with 20 random Azure service names and their definitions."
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "azure_services_schema",
                    "schema": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["service", "definition"],
                            "properties": {
                                "service": {"type": "string"},
                                "definition": {"type": "string"}
                            }
                        }
                    }
                }
            }
        )

        # Parse the OpenAI response
        return json.loads(completion.choices[0].message.content)
    
    except Exception as e:
        logging.error(f"Error generating random services: {str(e)}")
        # Fallback response
        fallback_services = random.sample(list(SERVICE_DEFINITIONS.items()), 20)
        return [{"service": service, "description": definition} for service, definition in fallback_services]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        random_services = generate_random_services()
        
        return func.HttpResponse(
            json.dumps(random_services),
            status_code=200,
            mimetype="application/json",
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        )
        
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype="application/json"
        )
