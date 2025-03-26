import * as levenshteinModule from 'fast-levenshtein';



export const AZURE_ICON_CATEGORIES = {
  AI_MACHINE_LEARNING: 'ai + machine learning',
  ANALYTICS: 'analytics',
  APP_SERVICES: 'app services',
  AZURE_ECOSYSTEM: 'azure ecosystem',
  AZURE_STACK: 'azure stack',
  BLOCKCHAIN: 'blockchain',
  COMPUTE: 'compute',
  CONTAINERS: 'containers',
  DATABASES: 'databases',
  DEVOPS: 'devops',
  GENERAL: 'general',
  HYBRID_MULTICLOUD: 'hybrid + multicloud',
  IDENTITY: 'identity',
  INTEGRATION: 'integration',
  INTUNE: 'intune',
  IOT: 'iot',
  MANAGEMENT_GOVERNANCE: 'management + governance',
  MENU: 'menu',
  MIGRATE: 'migrate',
  MIGRATION: 'migration',
  MIXED_REALITY: 'mixed reality',
  MOBILE: 'mobile',
  MONITOR: 'monitor',
  NETWORKING: 'networking',
  NEW_ICONS: 'new icons',
  OTHER: 'other',
  SECURITY: 'security',
  STORAGE: 'storage',
  WEB: 'web'
};


const SERVICE_MAPPINGS = {
  // AI + machine learning
  "Batch AI": "/ai + machine learning/00028-icon-service-Batch-AI.svg",
  "Machine Learning Studio (Classic) Web Services": "/ai + machine learning/00030-icon-service-Machine-Learning-Studio-(Classic)-Web-Services.svg",
  "Genomics": "/ai + machine learning/00031-icon-service-Genomics.svg",
  "Computer Vision": "/ai + machine learning/00792-icon-service-Computer-Vision.svg",
  "Custom Vision": "/ai + machine learning/00793-icon-service-Custom-Vision.svg",
  "Face APIs": "/ai + machine learning/00794-icon-service-Face-APIs.svg",
  "Content Moderators": "/ai + machine learning/00795-icon-service-Content-Moderators.svg",
  "Personalizers": "/ai + machine learning/00796-icon-service-Personalizers.svg",
  "Speech Services": "/ai + machine learning/00797-icon-service-Speech-Services.svg",
  "QnA Makers": "/ai + machine learning/00799-icon-service-QnA-Makers.svg",
  "Translator Text": "/ai + machine learning/00800-icon-service-Translator-Text.svg",
  "Language Understanding": "/ai + machine learning/00801-icon-service-Language-Understanding.svg",
  "Immersive Readers": "/ai + machine learning/00812-icon-service-Immersive-Readers.svg",
  "Anomaly Detector": "/ai + machine learning/00814-icon-service-Anomaly-Detector.svg",
  "Form Recognizers": "/ai + machine learning/00819-icon-service-Form-Recognizers.svg",
  "Azure Experimentation Studio": "/ai + machine learning/01239-icon-service-Azure-Experimentation-Studio.svg",
  "Azure Object Understanding": "/ai + machine learning/01688-icon-service-Azure-Object-Understanding.svg",
  "Metrics Advisor": "/ai + machine learning/02409-icon-service-Metrics-Advisor.svg",
  "Azure Applied AI Services": "/ai + machine learning/02749-icon-service-Azure-Applied-AI-Services.svg",
  "Language": "/ai + machine learning/02876-icon-service-Language.svg",
  "Cognitive Services Decisions": "/ai + machine learning/03173-icon-service-Cognitive-Services-Decisions.svg",
  "Serverless Search": "/ai + machine learning/03321-icon-service-Serverless-Search.svg",
  "Bonsai": "/ai + machine learning/03337-icon-service-Bonsai.svg",
  "Content Safety": "/ai + machine learning/03390-icon-service-Content-Safety.svg",
  "Azure OpenAI": "/ai + machine learning/03438-icon-service-Azure-OpenAI.svg",
  "AI Studio": "/ai + machine learning/03513-icon-service-AI-Studio.svg",
  "Cognitive Search": "/ai + machine learning/10044-icon-service-Cognitive-Search.svg",
  "Cognitive Services": "/ai + machine learning/10162-icon-service-Cognitive-Services.svg",
  "Genomics Accounts": "/ai + machine learning/10164-icon-service-Genomics-Accounts.svg",
  "Bot Services": "/ai + machine learning/10165-icon-service-Bot-Services.svg",


  // Analytics
  "Log Analytics Workspaces": "/analytics/00009-icon-service-Log-Analytics-Workspaces.svg",
  "Event Hubs": "/analytics/00039-icon-service-Event-Hubs.svg",
  "Stream Analytics Jobs": "/analytics/00042-icon-service-Stream-Analytics-Jobs.svg",
  "Endpoint Analytics": "/analytics/00562-icon-service-Endpoint-Analytics.svg",
  "Azure Synapse Analytics": "/analytics/00606-icon-service-Azure-Synapse-Analytics.svg",
  "Azure Workbooks": "/analytics/02189-icon-service-Azure-Workbooks.svg",
  "Private Link Services": "/analytics/02209-icon-service-Private-Link-Services.svg",
  "Power BI": "/analytics/03332-icon-service-Power-BI-Embedded.svg",
  "Power Platform": "/analytics/03335-icon-service-Power-Platform.svg",
  "Data Factories": "/analytics/10126-icon-service-Data-Factories.svg",
  "HD Insight Clusters": "/analytics/10142-icon-service-HD-Insight-Clusters.svg",
  "Data Lake Analytics": "/analytics/10143-icon-service-Data-Lake-Analytics.svg",
  "Azure Data Explorer Clusters": "/analytics/10145-icon-service-Azure-Data-Explorer-Clusters.svg",
  "Analysis Services": "/analytics/10148-icon-service-Analysis-Services.svg",
  "Event Hub Clusters": "/analytics/10149-icon-service-Event-Hub-Clusters.svg",
  "Data Lake Store Gen1": "/analytics/10150-icon-service-Data-Lake-Store-Gen1.svg",
  "Azure Databricks": "/analytics/10787-icon-service-Azure-Databricks.svg",

  // App Services
  "App Service Plans": "/app services/00046-icon-service-App-Service-Plans.svg",
  "App Service Certificates": "/app services/00049-icon-service-App-Service-Certificates.svg",
  "App Service Domains": "/app services/00050-icon-service-App-Service-Domains.svg",
  "CDN Profiles": "/app services/00056-icon-service-CDN-Profiles.svg",
  "App Services": "/app services/10035-icon-service-App-Services.svg",
  "Cognitive Search": "/app services/10044-icon-service-Cognitive-Search.svg",
  "Notification Hubs": "/app services/10045-icon-service-Notification-Hubs.svg",
  "App Service Environments": "/app services/10047-icon-service-App-Service-Environments.svg",


  // Azure Ecosystem
  "Collaborative Service": "/azure ecosystem/01038-icon-service-Collaborative-Service.svg",
  "Applens": "/azure ecosystem/02354-icon-service-Applens.svg",
  "Azure Hybrid Center": "/azure ecosystem/02573-icon-service-Azure-Hybrid-Center.svg",


  // Azure Stack
  "Multi Tenancy": "/azure stack/00965-icon-service-Multi-Tenancy.svg",
  "Infrastructure Backup": "/azure stack/10108-icon-service-Infrastructure-Backup.svg",
  "Capacity": "/azure stack/10109-icon-service-Capacity.svg",
  "Offers": "/azure stack/10110-icon-service-Offers.svg",
  "User Subscriptions": "/azure stack/10111-icon-service-User-Subscriptions.svg",
  "Plans": "/azure stack/10113-icon-service-Plans.svg",
  "Updates": "/azure stack/10115-icon-service-Updates.svg",

  // Blockchain
  "Blockchain Applications": "/blockchain/10210-icon-service-Blockchain-Applications.svg",
  "Outbound Connection": "/blockchain/10364-icon-service-Outbound-Connection.svg",
  "Azure Blockchain Service": "/blockchain/10366-icon-service-Azure-Blockchain-Service.svg",
  "Azure Token Service": "/blockchain/10367-icon-service-Azure-Token-Service.svg",
  "ABS Member": "/blockchain/10374-icon-service-ABS-Member.svg",
  "Consortium": "/blockchain/10375-icon-service-Consortium.svg",

  // Compute
  "Maintenance Configuration": "/compute/00195-icon-service-Maintenance-Configuration.svg",
  "Host Pools": "/compute/00328-icon-service-Host-Pools.svg",
  "Application Group": "/compute/00329-icon-service-Application-Group.svg",
  "Workspaces": "/compute/00330-icon-service-Workspaces.svg",
  "Disk Encryption Sets": "/compute/00398-icon-service-Disk-Encryption-Sets.svg",
  "Workspaces (Duplicate)": "/compute/00400-icon-service-Workspaces.svg",
  "Automanaged VM": "/compute/02112-icon-service-Automanaged-VM.svg",
  "Managed Service Fabric": "/compute/02370-icon-service-Managed-Service-Fabric.svg",
  "Metrics Advisor": "/compute/02409-icon-service-Metrics-Advisor.svg",
  "Image Templates": "/compute/02634-icon-service-Image-Templates.svg",
  "Restore Points": "/compute/02817-icon-service-Restore-Points.svg",
  "Restore Points Collections": "/compute/02818-icon-service-Restore-Points-Collections.svg",
  "Azure Compute Galleries": "/compute/02864-icon-service-Azure-Compute-Galleries.svg",
  "Compute Fleet": "/compute/03487-icon-service-Compute-Fleet.svg",
  "AKS Automatic": "/compute/03543-icon-service-AKS-Automatic.svg",
  "Virtual Machine": "/compute/10021-icon-service-Virtual-Machine.svg",
  "Kubernetes Services": "/compute/10023-icon-service-Kubernetes-Services.svg",
  "Mesh Applications": "/compute/10024-icon-service-Mesh-Applications.svg",
  "Availability Sets": "/compute/10025-icon-service-Availability-Sets.svg",
  "Disks Snapshots": "/compute/10026-icon-service-Disks-Snapshots.svg",
  "OS Images (Classic)": "/compute/10027-icon-service-OS-Images-(Classic).svg",
  "Virtual Machines (Classic)": "/compute/10028-icon-service-Virtual-Machines-(Classic).svg",
  "Azure Functions": "/compute/10029-icon-service-Function-Apps.svg",
  "Cloud Services (Classic)": "/compute/10030-icon-service-Cloud-Services-(Classic).svg",
  "Batch Accounts": "/compute/10031-icon-service-Batch-Accounts.svg",
  "Disks": "/compute/10032-icon-service-Disks.svg",
  "Images": "/compute/10033-icon-service-Images.svg",
  "VM Scale Sets": "/compute/10034-icon-service-VM-Scale-Sets.svg",
  "App Services (Duplicate)": "/compute/10035-icon-service-App-Services.svg",
  "Service Fabric Clusters": "/compute/10036-icon-service-Service-Fabric-Clusters.svg",

      // Containers
  "Azure Red Hat OpenShift": "/containers/03331-icon-service-Azure-Red-Hat-OpenShift.svg",
  "Kubernetes Services": "/containers/10023-icon-service-Kubernetes-Services.svg",
  "Batch Accounts": "/containers/10031-icon-service-Batch-Accounts.svg",
  "App Services": "/containers/10035-icon-service-App-Services.svg",
  "Service Fabric Clusters": "/containers/10036-icon-service-Service-Fabric-Clusters.svg",
  "Container Instances": "/containers/10104-icon-service-Container-Instances.svg",
  "Container Registries": "/containers/10105-icon-service-Container-Registries.svg",


    // Databases
    "SQL Data Warehouses": "/databases/00036-icon-service-SQL-Data-Warehouses.svg",
    "Azure Synapse Analytics": "/databases/00606-icon-service-Azure-Synapse-Analytics.svg",
    "Azure SQL": "/databases/02390-icon-service-Azure-SQL.svg",
    "SSIS Lift And Shift IR": "/databases/02392-icon-service-SSIS-Lift-And-Shift-IR.svg",
    "Azure Purview Accounts": "/databases/02517-icon-service-Azure-Purview-Accounts.svg",
    "Azure SQL Edge": "/databases/02750-icon-service-Azure-SQL-Edge.svg",
    "Azure Database PostgreSQL Server Group": "/databases/02827-icon-service-Azure-Database-PostgreSQL-Server-Group.svg",
    "Oracle Database": "/databases/03490-icon-service-Oracle-Database.svg",
    "Azure Cosmos DB": "/databases/10121-icon-service-Azure-Cosmos-DB.svg",
    "Azure Database MySQL Server": "/databases/10122-icon-service-Azure-Database-MySQL-Server.svg",
    "Azure Database MariaDB Server": "/databases/10123-icon-service-Azure-Database-MariaDB-Server.svg",
    "Azure SQL VM": "/databases/10124-icon-service-Azure-SQL-VM.svg",
    "Data Factories": "/databases/10126-icon-service-Data-Factories.svg",
    "Virtual Clusters": "/databases/10127-icon-service-Virtual-Clusters.svg",
    "Elastic Job Agents": "/databases/10128-icon-service-Elastic-Job-Agents.svg",
    "SQL Database": "/databases/10130-icon-service-SQL-Database.svg",
    "Azure Database PostgreSQL Server": "/databases/10131-icon-service-Azure-Database-PostgreSQL-Server.svg",
    "SQL Server": "/databases/10132-icon-service-SQL-Server.svg",
    "Azure Database Migration Services": "/databases/10133-icon-service-Azure-Database-Migration-Services.svg",
    "SQL Elastic Pools": "/databases/10134-icon-service-SQL-Elastic-Pools.svg",
    "Managed Database": "/databases/10135-icon-service-Managed-Database.svg",
    "SQL Managed Instance": "/databases/10136-icon-service-SQL-Managed-Instance.svg",
    "Azure SQL Server Stretch Databases": "/databases/10137-icon-service-Azure-SQL-Server-Stretch-Databases.svg",
    "Cache Redis": "/databases/10137-icon-service-Cache-Redis.svg",
    "Instance Pools": "/databases/10139-icon-service-Instance-Pools.svg",
    "Azure Data Explorer Clusters": "/databases/10145-icon-service-Azure-Data-Explorer-Clusters.svg",
    "SQL Server Registries": "/databases/10351-icon-service-SQL-Server-Registries.svg",

      // DevOps
  "Application Insights": "/devops/00012-icon-service-Application-Insights.svg",
  "Change Analysis": "/devops/00563-icon-service-Change-Analysis.svg",
  "CloudTest": "/devops/02373-icon-service-CloudTest.svg",
  "Load Testing": "/devops/02423-icon-service-Load-Testing.svg",
  "Lab Accounts": "/devops/02761-icon-service-Lab-Accounts.svg",
  "DevOps Starter": "/devops/03339-icon-service-DevOps-Starter.svg",
  "Managed DevOps Pools": "/devops/03393-icon-service-Managed-DevOps-Pools.svg",
  "Code Optimization": "/devops/03455-icon-service-Code-Optimization.svg",
  "Workspace Gateway": "/devops/03623-icon-service-Workspace-Gateway.svg",
  "API Management Services": "/devops/10042-icon-service-API-Management-Services.svg",
  "API Connections": "/devops/10048-icon-service-API-Connections.svg",
  "Azure DevOps": "/devops/10261-icon-service-Azure-DevOps.svg",
  "DevTest Labs": "/devops/10264-icon-service-DevTest-Labs.svg",
  "Lab Services": "/devops/10265-icon-service-Lab-Services.svg",

    // General
    "Cost Management and Billing": "/general/00004-icon-service-Cost-Management-and-Billing.svg",
    "Preview Features": "/general/00456-icon-service-Preview-Features.svg",
    "All Resources": "/general/10001-icon-service-All-Resources.svg",
    "Subscriptions": "/general/10002-icon-service-Subscriptions.svg",
    "Reservations": "/general/10003-icon-service-Reservations.svg",
    "Service Health": "/general/10004-icon-service-Service-Health.svg",
    "Information": "/general/10005-icon-service-Information.svg",
    "Recent": "/general/10006-icon-service-Recent.svg",
    "Resource Groups": "/general/10007-icon-service-Resource-Groups.svg",
    "Marketplace": "/general/10008-icon-service-Marketplace.svg",
    "Templates": "/general/10009-icon-service-Templates.svg",
    "Quickstart Center": "/general/10010-icon-service-Quickstart-Center.svg",
    "Management Groups": "/general/10011-icon-service-Management-Groups.svg",
    "Help and Support": "/general/10013-icon-service-Help-and-Support.svg",
    "Tag": "/general/10014-icon-service-Tag.svg",
    "Dashboard": "/general/10015-icon-service-Dashboard.svg",
    "Free Services": "/general/10016-icon-service-Free-Services.svg",
    "Cost Management": "/general/10019-icon-service-Cost-Management.svg",
    "Marketplace Management": "/general/10112-icon-service-Marketplace-Management.svg",
    "Region Management": "/general/10116-icon-service-Region-Management.svg",
    "Troubleshoot": "/general/10341-icon-service-Troubleshoot.svg",
    "Resource Explorer": "/general/10349-icon-service-Resource-Explorer.svg",
    "Biz Talk": "/general/10779-icon-service-Biz-Talk.svg",
    "Blob Block": "/general/10780-icon-service-Blob-Block.svg",
    "Blob Page": "/general/10781-icon-service-Blob-Page.svg",
    "Branch": "/general/10782-icon-service-Branch.svg",
    "Browser": "/general/10783-icon-service-Browser.svg",
    "Bug": "/general/10784-icon-service-Bug.svg",
    "Builds": "/general/10785-icon-service-Builds.svg",
    "Cache": "/general/10786-icon-service-Cache.svg",



    // Hybrid + Multicloud
    "Azure Operator 5G Core": "/hybrid + multicloud/03248-icon-service-Azure-Operator-5G-Core.svg",
    "Azure Operator Nexus": "/hybrid + multicloud/03324-icon-service-Azure-Operator-Nexus.svg",
    "Azure Operator Insights": "/hybrid + multicloud/03333-icon-service-Azure-Operator-Insights.svg",
    "Azure Operator Service Manager": "/hybrid + multicloud/03334-icon-service-Azure-Operator-Service-Manager.svg",
    "Azure Programmable Connectivity": "/hybrid + multicloud/03347-icon-service-Azure-Programmable-Connectivity.svg",
    "Azure Monitor Pipeline": "/hybrid + multicloud/03585-icon-service-Azure-Monitor-Pipeline.svg",
  
  // Identity
  "Security": "/identity/00321-icon-service-Security.svg",
  "Administrative Units": "/identity/00919-icon-service-Administrative-Units.svg",
  "Verifiable Credentials": "/identity/01084-icon-service-Verifiable-Credentials.svg",
  "Entra Privileged Identity Management": "/identity/02251-icon-service-Entra-Privileged-Identity-Management.svg",
  "API Proxy": "/identity/02386-icon-service-API-Proxy.svg",
  "Tenant Properties": "/identity/02679-icon-service-Tenant-Properties.svg",
  "Entra Identity Custom Roles": "/identity/02680-icon-service-Entra-Identity-Custom-Roles.svg",
  "Entra Identity Licenses": "/identity/02681-icon-service-Entra-Identity-Licenses.svg",
  "Entra Connect": "/identity/02854-icon-service-Entra-Connect.svg",
  "Entra Verified ID": "/identity/03143-icon-service-Entra-Verified-ID.svg",
  "Verification As A Service": "/identity/03225-icon-service-Verification-As-A-Service.svg",
  "Multi-Factor Authentication": "/identity/03256-icon-service-Multi-Factor-Authentication.svg",
  "Entra Global Secure Access": "/identity/03309-icon-service-Entra-Global-Secure-Access.svg",
  "External Identities": "/identity/03338-icon-service-External-Identities.svg",
  "Entra Private Access": "/identity/03382-icon-service-Entra-Private-Access.svg",
  "Entra Connect Sync": "/identity/03533-icon-service-Entra-Connect-Sync.svg",
  "Entra Domain Services": "/identity/10222-icon-service-Entra-Domain-Services.svg",
  "Groups": "/identity/10223-icon-service-Groups.svg",
  "Active Directory Connect Health": "/identity/10224-icon-service-Active-Directory-Connect-Health.svg",
  "Entra Connect Health": "/identity/10224-icon-service-Entra-Connect-Health.svg",
  "Enterprise Applications": "/identity/10225-icon-service-Enterprise-Applications.svg",
  "Entra Managed Identities": "/identity/10227-icon-service-Entra-Managed-Identities.svg",
  "Managed Identities": "/identity/10227-icon-service-Managed-Identities.svg",
  "Azure AD B2C": "/identity/10228-icon-service-Azure-AD-B2C.svg",
  "Azure Information Protection": "/identity/10229-icon-service-Azure-Information-Protection.svg",
  "Users": "/identity/10230-icon-service-Users.svg",
  "Entra ID Protection": "/identity/10231-icon-service-Entra-ID-Protection.svg",
  "App Registrations": "/identity/10232-icon-service-App-Registrations.svg",
  "Identity Governance": "/identity/10235-icon-service-Identity-Governance.svg",

  // Integration
  "API Connections": "/integration/10048-icon-service-API-Connections.svg",
  "API Management Services": "/integration/10042-icon-service-API-Management-Services.svg",
  "App Configuration": "/integration/10219-icon-service-App-Configuration.svg",
  "Azure API for FHIR": "/integration/10212-icon-service-Azure-API-for-FHIR.svg",
  "Azure Data Catalog": "/integration/10216-icon-service-Azure-Data-Catalog.svg",
  "Azure Databox Gateway": "/integration/00691-icon-service-Azure-Databox-Gateway.svg",
  "Azure SQL Server Stretch Databases": "/integration/10137-icon-service-Azure-SQL-Server-Stretch-Databases.svg",
  "Azure Service Bus": "/integration/10836-icon-service-Azure-Service-Bus.svg",
  "Azure Stack Edge": "/integration/10095-icon-service-Azure-Stack-Edge.svg",
  "Business Process Tracking": "/integration/03637-icon-service-Business-Process-Tracking.svg",
  "Data Factory": "/integration/10126-icon-service-Data-Factories.svg",
  "Event Grid Domains": "/integration/10215-icon-service-Event-Grid-Domains.svg",
  "Event Grid Subscriptions": "/integration/10221-icon-service-Event-Grid-Subscriptions.svg",
  "Event Grid Topics": "/integration/10206-icon-service-Event-Grid-Topics.svg",
  "Integration Accounts": "/integration/10218-icon-service-Integration-Accounts.svg",
  "Integration Environments": "/integration/03345-icon-service-Integration-Environments.svg",
  "Integration Service Environments": "/integration/00555-icon-service-Integration-Service-Environments.svg",
  "Logic Apps": "/integration/02631-icon-service-Logic-Apps.svg",
  "Logic Apps Custom Connector": "/integration/10363-icon-service-Logic-Apps-Custom-Connector.svg",
  "Partner Namespace": "/integration/02266-icon-service-Partner-Namespace.svg",
  "Partner Registration": "/integration/02265-icon-service-Partner-Registration.svg",
  "Partner Topic": "/integration/02072-icon-service-Partner-Topic.svg",
  "Power Platform": "/integration/03335-icon-service-Power-Platform.svg",
  "Relays": "/integration/10209-icon-service-Relays.svg",
  "SQL Data Warehouses": "/integration/00036-icon-service-SQL-Data-Warehouses.svg",
  "SendGrid Accounts": "/integration/10220-icon-service-SendGrid-Accounts.svg",
  "Software as a Service": "/integration/10213-icon-service-Software-as-a-Service.svg",
  "StorSimple Device Managers": "/integration/10089-icon-service-StorSimple-Device-Managers.svg",
  "System Topic": "/integration/02073-icon-service-System-Topic.svg",

    // Intune
    "Device Security Apple": "/intune/00399-icon-service-Device-Security-Apple.svg",
    "Device Security Google": "/intune/00399-icon-service-Device-Security-Google.svg",
    "Device Security Windows": "/intune/00399-icon-service-Device-Security-Windows.svg",
    "Intune": "/intune/10329-icon-service-Intune.svg",
    "eBooks": "/intune/10330-icon-service-eBooks.svg",
    "Client Apps": "/intune/10331-icon-service-Client-Apps.svg",
    "Devices": "/intune/10332-icon-service-Devices.svg",
    "Device Compliance": "/intune/10333-icon-service-Device-Compliance.svg",
    "Software Updates": "/intune/10335-icon-service-Software-Updates.svg",
    "Security Baselines": "/intune/10336-icon-service-Security-Baselines.svg",
    "Device Enrollment": "/intune/10337-icon-service-Device-Enrollment.svg",
    "Device Configuration": "/intune/10338-icon-service-Device-Configuration.svg",
    "Exchange Access": "/intune/10339-icon-service-Exchange-Access.svg",
    "Entra Identity Roles and Administrators": "/intune/10340-icon-service-Entra-Identity-Roles-and-Administrators.svg",
    "Tenant Status": "/intune/10342-icon-service-Tenant-Status.svg",
    "Intune For Education": "/intune/10343-icon-service-Intune-For-Education.svg",
    "Intune App Protection": "/intune/10344-icon-service-Intune-App-Protection.svg",
    "Mindaro": "/intune/10350-icon-service-Mindaro.svg",

  // IoT
  "Machine Learning Studio (Classic) Web Services": "/iot/00030-icon-service-Machine-Learning-Studio-(Classic)-Web-Services.svg",
  "Event Hubs": "/iot/00039-icon-service-Event-Hubs.svg",
  "Stream Analytics Jobs": "/iot/00042-icon-service-Stream-Analytics-Jobs.svg",
  "Azure Databox Gateway": "/iot/00691-icon-service-Azure-Databox-Gateway.svg",
  "Digital Twins": "/iot/01030-icon-service-Digital-Twins.svg",
  "Industrial IoT": "/iot/02359-icon-service-Industrial-IoT.svg",
  "Logic Apps": "/iot/02631-icon-service-Logic-Apps.svg",
  "Azure Stack HCI Sizer": "/iot/03293-icon-service-Azure-Stack-HCI-Sizer.svg",
  "Stack HCI Premium": "/iot/03466-icon-service-Stack-HCI-Premium.svg",
  "Azure IoT Operations": "/iot/03485-icon-service-Azure-IoT-Operations.svg",
  "Function Apps": "/iot/10029-icon-service-Function-Apps.svg",
  "Notification Hubs": "/iot/10045-icon-service-Notification-Hubs.svg",
  "Notification Hub Namespaces": "/iot/10053-icon-service-Notification-Hub-Namespaces.svg",
  "Azure Stack": "/iot/10114-icon-service-Azure-Stack.svg",
  "Azure Cosmos DB": "/iot/10121-icon-service-Azure-Cosmos-DB.svg",
  "Event Hub Clusters": "/iot/10149-icon-service-Event-Hub-Clusters.svg",
  "Machine Learning Studio Workspaces": "/iot/10167-icon-service-Machine-Learning-Studio-Workspaces.svg",
  "Machine Learning Studio Web Service Plans": "/iot/10168-icon-service-Machine-Learning-Studio-Web-Service-Plans.svg",
  "Time Series Insights Environments": "/iot/10181-icon-service-Time-Series-Insights-Environments.svg",
  "IoT Hub": "/iot/10182-icon-service-IoT-Hub.svg",
  "IoT Central Applications": "/iot/10184-icon-service-IoT-Central-Applications.svg",
  "Azure Maps Accounts": "/iot/10185-icon-service-Azure-Maps-Accounts.svg",
  "IoT Edge": "/iot/10186-icon-service-IoT-Edge.svg",
  "Time Series Insights Event Sources": "/iot/10188-icon-service-Time-Series-Insights-Event-Sources.svg",
  "Time Series Insights Access Policies": "/iot/10192-icon-service-Time-Series-Insights-Access-Policies.svg",
  "Time Series Data Sets": "/iot/10198-icon-service-Time-Series-Data-Sets.svg",
  "Windows10 Core Services": "/iot/10203-icon-service-Windows10-Core-Services.svg",
  "Event Grid Subscriptions": "/iot/10221-icon-service-Event-Grid-Subscriptions.svg",
  "Device Provisioning Services": "/iot/10369-icon-service-Device-Provisioning-Services.svg",

    // Management + Governance
    "Monitor": "/management + governance/00001-icon-service-Monitor.svg",
    "Alerts": "/management + governance/00002-icon-service-Alerts.svg",
    "Advisor": "/management + governance/00003-icon-service-Advisor.svg",
    "Cost Management and Billing": "/management + governance/00004-icon-service-Cost-Management-and-Billing.svg",
    "Blueprints": "/management + governance/00006-icon-service-Blueprints.svg",
    "Activity Log": "/management + governance/00007-icon-service-Activity-Log.svg",
    "Diagnostics Settings": "/management + governance/00008-icon-service-Diagnostics-Settings.svg",
    "Log Analytics Workspaces": "/management + governance/00009-icon-service-Log-Analytics-Workspaces.svg",
    "Scheduler Job Collections": "/management + governance/00010-icon-service-Scheduler-Job-Collections.svg",
    "Compliance": "/management + governance/00011-icon-service-Compliance.svg",
    "Application Insights": "/management + governance/00012-icon-service-Application-Insights.svg",
    "My Customers": "/management + governance/00014-icon-service-My-Customers.svg",
    "Recovery Services Vaults": "/management + governance/00017-icon-service-Recovery-Services-Vaults.svg",
    "Metrics": "/management + governance/00020-icon-service-Metrics.svg",
    "Solutions": "/management + governance/00021-icon-service-Solutions.svg",
    "Automation Accounts": "/management + governance/00022-icon-service-Automation-Accounts.svg",
    "Operation Log (Classic)": "/management + governance/00024-icon-service-Operation-Log-(Classic).svg",
    "Service Providers": "/management + governance/00025-icon-service-Service-Providers.svg",
    "Education": "/management + governance/00026-icon-service-Education.svg",
    "Service Catalog MAD": "/management + governance/00027-icon-service-Service-Catalog-MAD.svg",
    "Intune Trends": "/management + governance/00408-icon-service-Intune-Trends.svg",
    "Azure Lighthouse": "/management + governance/00471-icon-service-Azure-Lighthouse.svg",
    "Universal Print": "/management + governance/00571-icon-service-Universal-Print.svg",
    "Azure Arc": "/management + governance/00756-icon-service-Azure-Arc.svg",
    "Arc Machines": "/management + governance/01710-icon-service-Arc-Machines.svg",
    "Resources Provider": "/management + governance/03366-icon-service-Resources-Provider.svg",
    "User Privacy": "/management + governance/10303-icon-service-User-Privacy.svg",
    "Managed Desktop": "/management + governance/10311-icon-service-Managed-Desktop.svg",
    "Managed Applications Center": "/management + governance/10313-icon-service-Managed-Applications-Center.svg",
    "Customer Lockbox for Microsoft Azure": "/management + governance/10314-icon-service-Customer-Lockbox-for-Microsoft-Azure.svg",

     // Menu
    "Keys": "/menu/00787-icon-service-Keys.svg",


      // Migrate
  "Cost Management and Billing": "/migrate/00004-icon-service-Cost-Management-and-Billing.svg",
  "Recovery Services Vaults": "/migrate/00017-icon-service-Recovery-Services-Vaults.svg",
  "Azure Databox Gateway": "/migrate/00691-icon-service-Azure-Databox-Gateway.svg",
  "Data Box": "/migrate/10094-icon-service-Data-Box.svg",
  "Azure Stack Edge": "/migrate/10095-icon-service-Azure-Stack-Edge.svg",
  "Azure Migrate": "/migrate/10281-icon-service-Azure-Migrate.svg",

    // Migration
    "Azure Database Migration Services": "/migration/10133-icon-service-Azure-Database-Migration-Services.svg",


      // Mixed Reality
  "Remote Rendering": "/mixed reality/00698-icon-service-Remote-Rendering.svg",
  "Spatial Anchor Accounts": "/mixed reality/10352-icon-service-Spatial-Anchor-Accounts.svg",


    // Mobile
    "Power Platform": "/mobile/03335-icon-service-Power-Platform.svg",
    "App Services": "/mobile/10035-icon-service-App-Services.svg",
    "Notification Hubs": "/mobile/10045-icon-service-Notification-Hubs.svg",

  
  // Monitor
  "Monitor": "/monitor/00001-icon-service-Monitor.svg",
  "Activity Log": "/monitor/00007-icon-service-Activity-Log.svg",
  "Diagnostics Settings": "/monitor/00008-icon-service-Diagnostics-Settings.svg",
  "Log Analytics Workspaces": "/monitor/00009-icon-service-Log-Analytics-Workspaces.svg",
  "Application Insights": "/monitor/00012-icon-service-Application-Insights.svg",
  "Metrics": "/monitor/00020-icon-service-Metrics.svg",
  "Azure Monitors for SAP Solutions": "/monitor/00438-icon-service-Azure-Monitors-for-SAP-Solutions.svg",
  "Change Analysis": "/monitor/00563-icon-service-Change-Analysis.svg",
  "Azure Workbooks": "/monitor/02189-icon-service-Azure-Workbooks.svg",
  "Network Watcher": "/monitor/10066-icon-service-Network-Watcher.svg",
  "Auto Scale": "/monitor/10832-icon-service-Auto-Scale.svg",


    // Networking
    "CDN Profiles": "/networking/00056-icon-service-CDN-Profiles.svg",
    "Azure Firewall Manager": "/networking/00271-icon-service-Azure-Firewall-Manager.svg",
    "Azure Firewall Policy": "/networking/00272-icon-service-Azure-Firewall-Policy.svg",
    "Private Link": "/networking/00427-icon-service-Private-Link.svg",
    "IP Groups": "/networking/00701-icon-service-IP-Groups.svg",
    "Virtual WAN Hub": "/networking/00860-icon-service-Virtual-WAN-Hub.svg",
    "Private Link Service": "/networking/01105-icon-service-Private-Link-Service.svg",
    "Resource Management Private Link": "/networking/02145-icon-service-Resource-Management-Private-Link.svg",
    "Private Link Services": "/networking/02209-icon-service-Private-Link-Services.svg",
    "Load Balancer Hub": "/networking/02302-icon-service-Load-Balancer-Hub.svg",
    "Bastions": "/networking/02422-icon-service-Bastions.svg",
    "Virtual Router": "/networking/02496-icon-service-Virtual-Router.svg",
    "Connected Cache": "/networking/02509-icon-service-Connected-Cache.svg",
    "Spot VMSS": "/networking/02692-icon-service-Spot-VMSS.svg",
    "Spot VM": "/networking/02695-icon-service-Spot-VM.svg",
    "Subnet": "/networking/02742-icon-service-Subnet.svg",
    "DNS Private Resolver": "/networking/02882-icon-service-DNS-Private-Resolver.svg",
    "Azure Communications Gateway": "/networking/03311-icon-service-Azure-Communications-Gateway.svg",
    "Application Gateway Containers": "/networking/03328-icon-service-Application-Gateway-Containers.svg",
    "DNS Security Policy": "/networking/03368-icon-service-DNS-Security-Policy.svg",
    "DNS Multistack": "/networking/03459-icon-service-DNS-Multistack.svg",
    "ATM Multistack": "/networking/03460-icon-service-ATM-Multistack.svg",
    "IP Address Manager": "/networking/03461-icon-service-IP-Address-manager.svg",
    "Virtual Networks": "/networking/10061-icon-service-Virtual-Networks.svg",
    "Load Balancers": "/networking/10062-icon-service-Load-Balancers.svg",
    "Virtual Network Gateways": "/networking/10063-icon-service-Virtual-Network-Gateways.svg",
    "DNS Zones": "/networking/10064-icon-service-DNS-Zones.svg",
    "Traffic Manager Profiles": "/networking/10065-icon-service-Traffic-Manager-Profiles.svg",
    "Network Watcher": "/networking/10066-icon-service-Network-Watcher.svg",
    "Network Security Groups": "/networking/10067-icon-service-Network-Security-Groups.svg",


  // New Icons
  "Toolchain Orchestrator": "/new icons/029109619-icon-service-Toolchain-Orchestrator.svg",
  "Edge Actions": "/new icons/029273094-icon-service-Edge-Actions.svg",
  "Landing Zone": "/new icons/029636048-icon-service-Landing-Zone.svg",
  "External ID": "/new icons/03425-icon-service-external-id.svg",
  "External ID Modified": "/new icons/034251-icon-service-external-id-modified.svg",
  "Edge Storage Accelerator": "/new icons/03521-icon-service-Edge-Storage-Accelerator.svg",
  "Breeze": "/new icons/03633-icon-service-Breeze.svg",
  "Azure Managed Redis": "/new icons/03675-icon-service-Azure-Managed-Redis.svg",
  "AI at Edge": "/new icons/03687-icon-service-AI-at-Edge.svg",
  "VPN Client Windows": "/new icons/03694-icon-service-VPNClientWindows.svg",


    // Networking
    "CDN Profiles": "/networking/00056-icon-service-CDN-Profiles.svg",
    "Azure Firewall Manager": "/networking/00271-icon-service-Azure-Firewall-Manager.svg",
    "Azure Firewall Policy": "/networking/00272-icon-service-Azure-Firewall-Policy.svg",
    "Private Link": "/networking/00427-icon-service-Private-Link.svg",
    "IP Groups": "/networking/00701-icon-service-IP-Groups.svg",
    "Virtual WAN Hub": "/networking/00860-icon-service-Virtual-WAN-Hub.svg",
    "Private Link Service": "/networking/01105-icon-service-Private-Link-Service.svg",
    "Resource Management Private Link": "/networking/02145-icon-service-Resource-Management-Private-Link.svg",
    "Private Link Services": "/networking/02209-icon-service-Private-Link-Services.svg",
    "Load Balancer Hub": "/networking/02302-icon-service-Load-Balancer-Hub.svg",
    "Bastions": "/networking/02422-icon-service-Bastions.svg",
    "Virtual Router": "/networking/02496-icon-service-Virtual-Router.svg",
    "Connected Cache": "/networking/02509-icon-service-Connected-Cache.svg",
    "Spot VMSS": "/networking/02692-icon-service-Spot-VMSS.svg",
    "Spot VM": "/networking/02695-icon-service-Spot-VM.svg",
    "Subnet": "/networking/02742-icon-service-Subnet.svg",
    "DNS Private Resolver": "/networking/02882-icon-service-DNS-Private-Resolver.svg",
    "Azure Communications Gateway": "/networking/03311-icon-service-Azure-Communications-Gateway.svg",
    "Application Gateway Containers": "/networking/03328-icon-service-Application-Gateway-Containers.svg",
    "DNS Security Policy": "/networking/03368-icon-service-DNS-Security-Policy.svg",
    "DNS Multistack": "/networking/03459-icon-service-DNS-Multistack.svg",
    "ATM Multistack": "/networking/03460-icon-service-ATM-Multistack.svg",
    "IP Address Manager": "/networking/03461-icon-service-IP-Address-manager.svg",
    "Virtual Networks": "/networking/10061-icon-service-Virtual-Networks.svg",
    "Load Balancers": "/networking/10062-icon-service-Load-Balancers.svg",
    "Virtual Network Gateways": "/networking/10063-icon-service-Virtual-Network-Gateways.svg",
    "DNS Zones": "/networking/10064-icon-service-DNS-Zones.svg",
    "Traffic Manager Profiles": "/networking/10065-icon-service-Traffic-Manager-Profiles.svg",
    "Network Watcher": "/networking/10066-icon-service-Network-Watcher.svg",
    "Network Security Groups": "/networking/10067-icon-service-Network-Security-Groups.svg",


  
  // Security
  "Detonation": "/security/00378-icon-service-Detonation.svg",
  "Microsoft Defender for IoT": "/security/02247-icon-service-Microsoft-Defender-for-IoT.svg",
  "Microsoft Defender EASM": "/security/03336-icon-service-Microsoft-Defender-EASM.svg",
  "Identity Secure Score": "/security/03340-icon-service-Identity-Secure-Score.svg",
  "Entra Identity Risky Signins": "/security/03341-icon-service-Entra-Identity-Risky-Signins.svg",
  "Entra Identity Risky Users": "/security/03342-icon-service-Entra-Identity-Risky-Users.svg",
  "Multifactor Authentication": "/security/03344-icon-service-Multifactor-Authentication.svg",
  "Azure Information Protection": "/security/10229-icon-service-Azure-Information-Protection.svg",
  "Conditional Access": "/security/10233-icon-service-Conditional-Access.svg",
  "Microsoft Defender for Cloud": "/security/10241-icon-service-Microsoft-Defender-for-Cloud.svg",
  "Application Security Groups": "/security/10244-icon-service-Application-Security-Groups.svg",
  "Key Vaults": "/security/10245-icon-service-Key-Vaults.svg",
  "Azure Sentinel": "/security/10248-icon-service-Azure-Sentinel.svg",
  "User Settings": "/security/10433-icon-service-User-Settings.svg",
  "Extended Security Updates": "/security/10572-icon-service-ExtendedSecurityUpdates.svg",


  // Storage
  "Recovery Services Vaults": "/storage/00017-icon-service-Recovery-Services-Vaults.svg",
  "Azure Databox Gateway": "/storage/00691-icon-service-Azure-Databox-Gateway.svg",
  "Azure HCP Cache": "/storage/00776-icon-service-Azure-HCP-Cache.svg",
  "Storage Actions": "/storage/03502-icon-service-Storage-Actions.svg",
  "Managed File Shares": "/storage/03549-icon-service-Managed-File-Shares.svg",
  "Storage Accounts": "/storage/10086-icon-service-Storage-Accounts.svg",
  "Storage Accounts (Classic)": "/storage/10087-icon-service-Storage-Accounts-(Classic).svg",
  "StorSimple Device Managers": "/storage/10089-icon-service-StorSimple-Device-Managers.svg",
  "Data Lake Storage Gen1": "/storage/10090-icon-service-Data-Lake-Storage-Gen1.svg",
  "Storage Explorer": "/storage/10091-icon-service-Storage-Explorer.svg",
  "StorSimple Data Managers": "/storage/10092-icon-service-StorSimple-Data-Managers.svg",
  "Storage Sync Services": "/storage/10093-icon-service-Storage-Sync-Services.svg",
  "Data Box": "/storage/10094-icon-service-Data-Box.svg",
  "Azure Stack Edge": "/storage/10095-icon-service-Azure-Stack-Edge.svg",
  "Azure NetApp Files": "/storage/10096-icon-service-Azure-NetApp-Files.svg",
  "Data Share Invitations": "/storage/10097-icon-service-Data-Share-Invitations.svg",
  "Data Shares": "/storage/10098-icon-service-Data-Shares.svg",
  "Import Export Jobs": "/storage/10100-icon-service-Import-Export-Jobs.svg",
  "Azure Fileshares": "/storage/10400-icon-service-Azure-Fileshares.svg",
  "Azure Blob Storage": "/storage/azure-blob-storage-svgrepo-com.svg",

 // Web
  "App Service Plans": "/web/00046-icon-service-App-Service-Plans.svg",
  "App Service Certificates": "/web/00049-icon-service-App-Service-Certificates.svg",
  "App Service Domains": "/web/00050-icon-service-App-Service-Domains.svg",
  "Static Apps": "/web/01007-icon-service-Static-Apps.svg",
  "Api Center": "/web/03291-icon-service-API-Center.svg",
  "Power Platform": "/web/03335-icon-service-Power-Platform.svg",
  "App Space": "/web/03397-icon-service-App-Space.svg",
  "App Space Component": "/web/03595-icon-service-App-Space-Component.svg",
  "App Services": "/web/10035-icon-service-App-Services.svg",
  "Api Management Services": "/web/10042-icon-service-API-Management-Services.svg",
  "Cognitive Search": "/web/10044-icon-service-Cognitive-Search.svg",
  "App Service Environments": "/web/10047-icon-service-App-Service-Environments.svg",
  "Api Connections": "/web/10048-icon-service-API-Connections.svg",
  "Signalr": "/web/10052-icon-service-SignalR.svg",
  "Notification Hub Namespaces": "/web/10053-icon-service-Notification-Hub-Namespaces.svg",
  "Front Door And Cdn Profiles": "/web/10073-icon-service-Front-Door-and-CDN-Profiles.svg",
  "Cognitive Services": "/web/10162-icon-service-Cognitive-Services.svg",
  "Azure Media Service": "/web/10309-icon-service-Azure-Media-Service.svg",
  "Azure Spring Apps": "/web/10370-icon-service-Azure-Spring-Apps.svg"

};


  
const S3_BUCKET_URL = process.env.REACT_APP_AZURE_BUCKET_URL;
const ICONS_BASE_PATH = process.env.REACT_APP_ICONS_BASE_PATH;
const DEFAULT_ICON = '/azure-icons/default.svg';
const MISSING_ICON = '/azure-icons/missing.svg';

// Cache for resolved icons
const iconCache = new Map();


// Helper function to normalize service names
const normalizeServiceName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(azure)\s+/i, '')  // Remove Azure prefix
    .replace(/\([^)]*\)/g, '')    // Remove parentheses and content
    .replace(/\s+/g, ' ')         // Normalize spaces
    .trim();
};

// Create a more efficient lookup structure
const SERVICE_LOOKUP = {};

// Initialize lookup table
Object.entries(SERVICE_MAPPINGS).forEach(([key, value]) => {
  const normalizedKey = normalizeServiceName(key);
  SERVICE_LOOKUP[normalizedKey] = value;
});

// Central function for getting service icons
const getServiceIcon = (serviceName) => {
  if (!serviceName) {
    console.error('❌ No service name provided to getServiceIcon');
    return DEFAULT_ICON;
  }

  // Handle missing services first
  if (serviceName.toLowerCase().includes('missing')) {
    console.log('Loading missing service icon locally:', MISSING_ICON);
    return MISSING_ICON;
  }

  // Check cache first
  if (iconCache.has(serviceName)) {
    return iconCache.get(serviceName);
  }

  // Try direct match first (case insensitive)
  if (SERVICE_MAPPINGS[serviceName]) {
    const fullUrl = `${S3_BUCKET_URL}${ICONS_BASE_PATH}${SERVICE_MAPPINGS[serviceName]}`;
    iconCache.set(serviceName, fullUrl);
    console.log(`✅ Direct match found for ${serviceName}`);
    return fullUrl;
  }

  // Clean and normalize the input service name
  const normalizedInput = normalizeServiceName(serviceName);
  
  // Try normalized lookup
  if (SERVICE_LOOKUP[normalizedInput]) {
    const path = SERVICE_LOOKUP[normalizedInput];
    const fullUrl = `${S3_BUCKET_URL}${ICONS_BASE_PATH}${path}`;
    iconCache.set(serviceName, fullUrl);
    console.log(`✅ Exact match found for ${serviceName}`);
    return fullUrl;
  }
  
  // Find the best match
  let bestMatch = null;
  let bestScore = Infinity;

  // Limit the number of entries we check to avoid performance issues
  const entries = Object.entries(SERVICE_MAPPINGS);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const normalizedKey = normalizeServiceName(key);
    
    // Check if one string contains the other
    if (normalizedKey.includes(normalizedInput) || normalizedInput.includes(normalizedKey)) {
      const score = 1; // Prioritize partial matches over Levenshtein
      if (score < bestScore) {
        bestScore = score;
        bestMatch = [key, value];
      }
    } else {
      // Use Levenshtein only for promising candidates to improve performance
      if (Math.abs(normalizedKey.length - normalizedInput.length) < 3) {
        const score = levenshteinModule.get(normalizedKey, normalizedInput);
        if (score < bestScore && score < 3) { // threshold of 3 for similarity
          bestScore = score;
          bestMatch = [key, value];
        }
      }
    }
  }

  if (!bestMatch) {
    // Only log once per service name and save the default in cache
    iconCache.set(serviceName, DEFAULT_ICON);
    console.warn(`⚠️ No icon mapping found for service: ${serviceName}`);
    return DEFAULT_ICON;
  }

  const fullUrl = `${S3_BUCKET_URL}${ICONS_BASE_PATH}${bestMatch[1]}`;
  console.log(`🎨 Resolved icon for ${serviceName}: ${bestMatch[0]}`);
  
  // Cache the result
  iconCache.set(serviceName, fullUrl);
  
  return fullUrl;
};

// Maintain the existing getCachedServiceIcon for backward compatibility
const getCachedServiceIcon = (serviceName) => {
  return getServiceIcon(serviceName); // Just call the central function
};

// Add a new function to handle img onError events
const handleIconError = (e, serviceName) => {
  console.log(`Failed to load icon for ${serviceName}, using default`);
  e.target.src = DEFAULT_ICON;
};

export {
  SERVICE_MAPPINGS,
  getCachedServiceIcon,
  handleIconError,
  getServiceIcon
};