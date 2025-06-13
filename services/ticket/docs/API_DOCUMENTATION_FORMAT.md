# API Documentation Format Guide

This guide explains how to format API documentation files for use with the API Ticketing Support system. The system supports both JSON and XLSX file formats.

## JSON Format

JSON files should follow a specific structure to be properly processed by the vectorizer. Here's the recommended format:

```json
{
  "info": {
    "title": "API Name",
    "description": "Detailed description of the API",
    "version": "1.0.0",
    "contact": {
      "name": "API Support Team",
      "email": "api-support@example.com",
      "url": "https://example.com/api-support"
    }
  },
  "servers": [
    {
      "url": "https://api.example.com/v1",
      "description": "Production server"
    },
    {
      "url": "https://api-staging.example.com/v1",
      "description": "Staging server"
    }
  ],
  "endpoints": [
    {
      "path": "/resource",
      "method": "GET",
      "summary": "List resources",
      "description": "Returns a list of resources based on the provided filters",
      "parameters": [
        {
          "name": "status",
          "in": "query",
          "description": "Filter by status",
          "type": "string",
          "enum": ["active", "inactive", "pending"]
        }
      ]
    }
  ],
  "models": {
    "Resource": {
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier"
        },
        "name": {
          "type": "string",
          "description": "Resource name"
        }
      }
    }
  },
  "errors": [
    {
      "code": "400",
      "name": "BadRequest",
      "description": "The request could not be understood"
    },
    {
      "code": "401",
      "name": "Unauthorized",
      "description": "Authentication is required"
    }
  ],
  "authentication": {
    "type": "OAuth2",
    "description": "OAuth 2.0 authentication is required",
    "flows": {
      "clientCredentials": {
        "tokenUrl": "https://auth.example.com/oauth/token",
        "scopes": {
          "read": "Read access",
          "write": "Write access"
        }
      }
    }
  }
}
```

### Key Sections

1. **info**: General information about the API
2. **servers**: List of server environments
3. **endpoints**: API endpoints with methods, parameters, and descriptions
4. **models**: Data models used by the API
5. **errors**: Error codes and descriptions
6. **authentication**: Authentication methods and requirements

## XLSX Format

XLSX files should be structured with specific sheets for different aspects of the API documentation:

### Sheet 1: Endpoints

| Path | Method | Summary | Description | Parameters | Request Body | Response |
|------|--------|---------|-------------|------------|--------------|----------|
| /users | GET | List users | Returns a list of users | status=active,role=admin | N/A | Array of User objects |
| /users | POST | Create user | Creates a new user | N/A | {"name": "string", "email": "string"} | User object |

### Sheet 2: Error Codes

| Code | Name | Description | Resolution |
|------|------|-------------|------------|
| 400 | Bad Request | The request could not be understood | Check request format and parameters |
| 401 | Unauthorized | Authentication is required | Provide valid authentication credentials |

### Sheet 3: Authentication

| Method | Description | Requirements | Example |
|--------|-------------|--------------|---------|
| OAuth 2.0 | Client credentials flow | Client ID and secret | `curl -X POST https://auth.example.com/oauth/token -d 'grant_type=client_credentials&client_id=xxx&client_secret=yyy'` |
| API Key | API key in header | Valid API key | `curl -H "X-API-Key: abcdef123456" https://api.example.com/resource` |

### Sheet 4: SLAs

| Priority | Response Time | Resolution Time | Description |
|----------|---------------|-----------------|-------------|
| P1 | 15 minutes | 2 hours | Critical issue affecting multiple customers |
| P2 | 30 minutes | 4 hours | High impact issue affecting a single customer |

### Sheet 5: Rate Limits

| Endpoint | Rate Limit | Period | Throttling Behavior |
|----------|------------|--------|---------------------|
| /users | 1000 | per minute | 429 Too Many Requests |
| /transactions | 500 | per minute | 429 Too Many Requests |

## Best Practices

1. **Be Comprehensive**: Include all relevant information about your API
2. **Use Clear Descriptions**: Write clear, concise descriptions for endpoints and parameters
3. **Include Examples**: Provide request and response examples where possible
4. **Document Errors**: Include all possible error codes and their resolutions
5. **Specify Authentication**: Clearly document authentication requirements
6. **Define SLAs**: Include service level agreements for different priority levels
7. **Document Rate Limits**: Specify rate limits for each endpoint

## Uploading Documentation

1. Click the upload button in the chat interface
2. Select your JSON or XLSX file
3. The system will process and index the file
4. You can then ask questions about the API documentation

## Example Queries

After uploading your API documentation, you can ask questions like:

- "What endpoints are available in the API?"
- "How do I authenticate with the API?"
- "What are the error codes for the API?"
- "What is the rate limit for the /users endpoint?"
- "What is the SLA for P1 tickets?"

## Troubleshooting

If your documentation is not being processed correctly:

1. **Check Format**: Ensure your JSON or XLSX file follows the format described above
2. **File Size**: Make sure your file is under the 10MB limit
3. **Encoding**: Use UTF-8 encoding for JSON files
4. **Sheet Names**: For XLSX files, use descriptive sheet names like "Endpoints", "Errors", etc.
5. **Required Fields**: Ensure all required fields are present in your documentation
