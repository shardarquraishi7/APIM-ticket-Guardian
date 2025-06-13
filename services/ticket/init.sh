#!/bin/bash

shippy login --silent
shippy project sia-copilot

# Define secrets
APP_ENV=$(shippy get secret sia --field=APP_ENV)

# Kong
KONG_CLIENT_ID=$(shippy get secret sia --field=KONG_CLIENT_ID)
KONG_CLIENT_SECRET=$(shippy get secret sia --field=KONG_CLIENT_SECRET)

# Workforce Identity
WORKFORCE_IDENTITY_JIRA_API_TOKEN=$(shippy get secret sia --field=WORKFORCE_IDENTITY_JIRA_API_TOKEN)
WORKFORCE_IDENTITY_JIRA_EMAIL=$(shippy get secret sia --field=WORKFORCE_IDENTITY_JIRA_EMAIL)
WORKFORCE_IDENTITY_JIRA_PROJECT_KEY=$(shippy get secret sia --field=WORKFORCE_IDENTITY_JIRA_PROJECT_KEY)
JIRA_BASE_URL=$(shippy get secret sia --field=JIRA_BASE_URL)

# OpenAI
OPENAI_API_KEY=$(shippy get secret sia --field=OPENAI_API_KEY)

# Slack
SLACK_BOT_TOKEN=$(shippy get secret sia --field=SLACK_BOT_TOKEN)
SIA_COPILOT_REQUEST_CHANNEL=$(shippy get secret sia --field=SIA_COPILOT_REQUEST_CHANNEL)

# GitHub
SIA_GH_APP_PRIVATE_KEY=$(shippy get secret sia --field=SIA_GH_APP_PRIVATE_KEY)
SIA_GH_APP_ID=$(shippy get secret sia --field=SIA_GH_APP_ID)
SIA_GH_INSTALLATION_ID=$(shippy get secret sia --field=SIA_GH_INSTALLATION_ID)

# Unicorn
UNICORN_PROXY_URL=$(shippy get secret sia --field=UNICORN_PROXY_URL)

# Database
DATABASE_URL=$(shippy get secret sia --field=DATABASE_URL)

FAKE_ID_TOKEN=$(shippy get secret sia --field=FAKE_ID_TOKEN)
# Write the secrets to the .env.local file
cat <<EOL > .env.local
# Application Environment
APP_ENV=${APP_ENV}
NEXT_PUBLIC_APP_ENV=${APP_ENV}

# Unicorn Proxy Configuration
UNICORN_PROXY_URL=${UNICORN_PROXY_URL}

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}

# Slack Integration
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
SIA_COPILOT_REQUEST_CHANNEL=${SIA_COPILOT_REQUEST_CHANNEL}

# GitHub App Configuration
SIA_GH_APP_PRIVATE_KEY='${SIA_GH_APP_PRIVATE_KEY}'
SIA_GH_APP_ID=${SIA_GH_APP_ID}
SIA_GH_INSTALLATION_ID=${SIA_GH_INSTALLATION_ID}

# Kong Authentication
KONG_CLIENT_ID=${KONG_CLIENT_ID}
KONG_CLIENT_SECRET=${KONG_CLIENT_SECRET}

# Jira Integration
WORKFORCE_IDENTITY_JIRA_API_TOKEN="${WORKFORCE_IDENTITY_JIRA_API_TOKEN}"
WORKFORCE_IDENTITY_JIRA_EMAIL=${WORKFORCE_IDENTITY_JIRA_EMAIL}
WORKFORCE_IDENTITY_JIRA_PROJECT_KEY=${WORKFORCE_IDENTITY_JIRA_PROJECT_KEY}
JIRA_BASE_URL=${JIRA_BASE_URL}

# Database Configuration
DATABASE_URL=${DATABASE_URL}

# Development/Testing
FAKE_ID_TOKEN=${FAKE_ID_TOKEN}
EOL

echo ".env.local file generated successfully!"
