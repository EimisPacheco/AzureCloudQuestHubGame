import logging
import azure.functions as func
import json
import os
import random
from typing import Dict, List, TypedDict
from openai import AzureOpenAI, OpenAIError  # Azure OpenAI client

# Azure OpenAI config from environment variables
ENDPOINT = os.environ["AZURE_OPENAI_ENDPOINT"]
API_KEY = os.environ["AZURE_OPENAI_API_KEY"]
API_VERSION = os.environ.get("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

# Initialize Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=ENDPOINT,
    api_key=API_KEY,
    api_version=API_VERSION,
)

class ServiceOption(TypedDict):
    service: str
    rating: float
    explanation: str
    isCorrect: bool
    isOptimal: bool

class MissingService(TypedDict):
    position: str
    optimizationFocus: str
    options: List[ServiceOption]

class Architecture(TypedDict):
    architecture: Dict[str, str]
    services: List[str]
    connections: List[Dict[str, str]]
    missingServices: List[MissingService]


ACRONYM_MAPPING = {
    'AAD': 'Azure Active Directory',
    'VM': 'Virtual Machines',
    'AKS': 'Azure Kubernetes Service',
    'App Service': 'App Service',
    'Functions': 'Azure Functions',
    'Logic Apps': 'Logic Apps',
    'SQL DB': 'Azure SQL Database',
    'Cosmos DB': 'Azure Cosmos DB',
    'Blob Storage': 'Azure Blob Storage',
    'File Storage': 'Azure Files',
    'Queue Storage': 'Azure Queue Storage',
    'Table Storage': 'Azure Table Storage',
    'VNet': 'Virtual Network',
    'NSG': 'Network Security Group',
    'App Gateway': 'Application Gateway',
    'Load Balancer': 'Azure Load Balancer',
    'Traffic Manager': 'Traffic Manager',
    'Front Door': 'Azure Front Door',
    'CDN': 'Azure Content Delivery Network',
    'DNS': 'Azure DNS',
    'Monitor': 'Azure Monitor',
    'Log Analytics': 'Log Analytics',
    'Security Center': 'Microsoft Defender for Cloud',
    'Key Vault': 'Azure Key Vault',
    'Policy': 'Azure Policy',
    'Blueprints': 'Azure Blueprints',
    'Automation': 'Azure Automation',
    'Bicep': 'Bicep',
    'ARM': 'Azure Resource Manager',
    'DevOps': 'Azure DevOps',
    'Synapse': 'Azure Synapse Analytics',
    'Data Factory': 'Azure Data Factory',
    'Databricks': 'Azure Databricks',
    'HDInsight': 'HDInsight',
    'Event Grid': 'Azure Event Grid',
    'Event Hubs': 'Azure Event Hubs',
    'Service Bus': 'Azure Service Bus',
    'Notification Hubs': 'Notification Hubs',
    'ML': 'Azure Machine Learning',
    'Cognitive Services': 'Cognitive Services',
    'Bot Service': 'Azure Bot Service',
    'Speech': 'Azure Speech Services',
    'Translator': 'Azure Translator',
    'Form Recognizer': 'Form Recognizer',
    'Computer Vision': 'Computer Vision',
    'Anomaly Detector': 'Anomaly Detector',
    'Purview': 'Microsoft Purview',
    'Backup': 'Azure Backup',
    'Site Recovery': 'Azure Site Recovery',
    'Bastion': 'Azure Bastion',
    'Firewall': 'Azure Firewall',
    'WAF': 'Web Application Firewall',
    'Sentinel': 'Microsoft Sentinel',
    'Arc': 'Azure Arc',
    'Stack': 'Azure Stack',
    'Spring Apps': 'Azure Spring Apps',
    'IoT Hub': 'IoT Hub',
    'Sphere': 'Azure Sphere',
    'Digital Twins': 'Azure Digital Twins',
    'Media Services': 'Azure Media Services',
    'Storage Explorer': 'Azure Storage Explorer',
    'Migration': 'Azure Migrate',
    'AVD': 'Azure Virtual Desktop',
    'ExpressRoute': 'ExpressRoute',
    'Private Link': 'Private Link',
    'Peering': 'VNet Peering',
    'Cost Management': 'Cost Management + Billing'
}


def validate_flow_structure(architecture_data: dict) -> bool:
    try:
        if not all(key in architecture_data for key in ['architecture', 'services', 'connections', 'missingServices']):
            raise ValueError("Missing required top-level keys")

        if not isinstance(architecture_data['services'], list):
            raise ValueError("Services must be a list")
        if not all(isinstance(s, str) for s in architecture_data['services']):
            raise ValueError("All services must be strings")

        if not isinstance(architecture_data['connections'], list):
            raise ValueError("Connections must be a list")

        service_names = set(architecture_data['services'])
        for conn in architecture_data['connections']:
            if not isinstance(conn, dict) or 'from' not in conn or 'to' not in conn:
                raise ValueError("Each connection must have 'from' and 'to' properties")
            if conn['from'] not in service_names or conn['to'] not in service_names:
                raise ValueError(f"Connection references non-existent service: {conn}")

        missing_services_count = len(architecture_data['missingServices'])
        if missing_services_count not in [3, 5, 7]:
            raise ValueError(f"Invalid number of missing services: {missing_services_count}")

        for ms in architecture_data['missingServices']:
            if not all(key in ms for key in ['position', 'optimizationFocus', 'options']):
                raise ValueError("Missing service missing required fields")
            if not isinstance(ms['options'], list) or len(ms['options']) != 4:
                raise ValueError("Each missing service must have exactly 4 options")

            for opt in ms['options']:
                if not all(key in opt for key in ['service', 'rating', 'explanation', 'isCorrect', 'isOptimal']):
                    raise ValueError("Service option missing required fields")

        return True

    except Exception as e:
        print(f"Validation error: {str(e)}")
        return False

def generate_architecture(difficulty: str) -> Architecture:
    if difficulty.upper() == "BEGINNER":
        missing_services_count = 3
    elif difficulty.upper() == "INTERMEDIATE":
        missing_services_count = 5
    elif difficulty.upper() == "ADVANCED":
        missing_services_count = 7
    else:
        missing_services_count = 3

    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are an Azure architecture expert. Generate realistic Azure architecture scenarios.

For each architecture:
- Provide a clear name (e.g., "Serverless Data Pipeline", "Scalable E-commerce Platform")
- Include a brief description explaining its purpose and key features
- Design a realistic service topology

For each missing service position:
- Ensure that the missing service placeholder (e.g., "missing_1") appears in the "services" array.
- Ensure that the missing service placeholder (e.g., "missing_1") appears in the "connections" array.
- Ensure that all the service names and missing service placeholder are in the correct order in the "services" array and the "connections" array.
- Place the missing service between existing services in the connections array (e.g., "from": "previous_service", "to": "missing_1").
- Include a specific question in each missing service block, formatted in a similar way as: "What is the ideal service for <position>?" (only in a similar way but be creative, no repetitive)
- Provide exactly 4 options: 2 correct (with 1 optimal) and 2 incorrect. Please, make sure you are not repeating the same service name in the same four option set.
- The optimal choice should randomly vary between cost-efficiency, performance, scalability, or maintainability.
- Explain why each option is or isn't suitable.

Generate an architecture with exactly {missing_services_count} missing services."""
                },
                {
                    "role": "user",
                    "content": f"Generate a random {difficulty} Azure cloud architecture with {missing_services_count} missing services. Make it a realistic scenario that a company might implement. Sometimes include architectures where two services share the same dependency from one service, and there are also parallel nodes."
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "azure_architecture_schema",
                    "schema": {
                        "type": "object",
                        "required": ["architecture", "services", "connections", "missingServices"],
                        "properties": {
                            "architecture": {
                                "type": "object",
                                "required": ["name", "description"],
                                "properties": {
                                    "name": {"type": "string"},
                                    "description": {"type": "string"}
                                }
                            },
                            "services": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "connections": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["from", "to"],
                                    "properties": {
                                        "from": {"type": "string"},
                                        "to": {"type": "string"}
                                    }
                                }
                            },
                            "missingServices": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["position", "options", "optimizationFocus", "question"],
                                    "properties": {
                                        "position": {"type": "string"},
                                        "optimizationFocus": {
                                            "type": "string",
                                            "enum": ["cost", "performance", "scalability", "maintainability"]
                                        },
                                        "question": {"type": "string"},
                                        "options": {
                                            "type": "array",
                                            "minItems": 4,
                                            "maxItems": 4,
                                            "items": {
                                                "type": "object",
                                                "required": ["service", "rating", "explanation", "isCorrect", "isOptimal"],
                                                "properties": {
                                                    "service": {"type": "string"},
                                                    "rating": {"type": "number"},
                                                    "explanation": {"type": "string"},
                                                    "isCorrect": {"type": "boolean"},
                                                    "isOptimal": {"type": "boolean"}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )

        return json.loads(completion.choices[0].message.content)

    except Exception as e:
        print(f"Error generating architecture: {str(e)}")

        services = random.sample(list(ACRONYM_MAPPING.keys()), missing_services_count + 1)
        missing_services = random.sample([s for s in ACRONYM_MAPPING.keys() if s not in services], missing_services_count)

        return {
            "architecture": {
                "name": "Fallback Architecture",
                "description": "A basic architecture generated due to an error."
            },
            "services": services,
            "connections": [
                {"from": services[i], "to": services[i + 1]}
                for i in range(len(services) - 1)
            ],
            "missingServices": [
                {
                    "position": f"Position {i + 1}",
                    "optimizationFocus": random.choice(["cost", "performance", "scalability", "maintainability"]),
                    "options": [
                        {
                            "service": service,
                            "rating": round(random.uniform(1, 10), 1),
                            "explanation": f"{ACRONYM_MAPPING[service]} could be used here",
                            "isCorrect": random.choice([True, False]),
                            "isOptimal": False
                        }
                        for service in random.sample(list(ACRONYM_MAPPING.keys()), 4)
                    ]
                }
                for i, service in enumerate(missing_services)
            ]
        }

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json() if req.get_body() else {}
        difficulty = body.get('difficulty', 'BEGINNER').upper()

        if difficulty not in ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']:
            difficulty = 'BEGINNER'

        architecture = generate_architecture(difficulty)

        return func.HttpResponse(
            json.dumps(architecture),
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