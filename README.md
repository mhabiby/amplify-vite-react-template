## AI-Powered Doctor Directory System

This repository provides a comprehensive doctor directory management system for medical buildings, featuring an AI agent that can intelligently handle queries about doctors, offices, and medical specialties.

## Overview

This application transforms a simple React+Vite template into a sophisticated doctor directory system with AWS Amplify backend integration. The AI agent can understand natural language queries and provide intelligent responses about the building's medical directory.

## Features

- **AI-Powered Search**: Natural language processing for directory queries
- **Doctor Management**: Complete profiles with specialties, contact info, and availability
- **Office Directory**: Room locations, floor plans, and amenities
- **Specialty Catalog**: Medical departments and specialty information
- **Real-time Chat Interface**: Interactive AI assistant for instant directory help
- **Responsive Design**: Modern UI that works on all devices

## AI Agent Capabilities

The intelligent directory assistant can:
- 🔍 **Find doctors** by name, specialty, or availability status
- 📍 **Locate offices** by room number, floor, or building section  
- 🏥 **Browse specialties** and medical departments
- 💬 **Answer questions** in natural language about the directory
- 📊 **Provide statistics** about doctors, offices, and specialties

## Data Models

### Doctor
- Personal information (name, title, contact)
- Medical specialty and department
- Office location and availability status
- Professional biography and profile image

### Office
- Room number, floor, and building location
- Capacity and available amenities
- Accessibility features

### Specialty
- Medical specialty name and description
- Associated department information

### Directory Queries
- AI conversation history and analytics
- Query types and response tracking

## Sample Queries

The AI agent understands queries like:
- "Find Dr. Smith"
- "Where is room 205?"
- "Show available doctors"
- "List cardiology specialists"
- "Find offices on floor 3"

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: AWS Amplify Gen2
- **Database**: Amazon DynamoDB with GraphQL API
- **Authentication**: Amazon Cognito
- **Styling**: Custom CSS with responsive design

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.