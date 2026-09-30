# Node Endpoint for Machine-to-Machine Authentication

This repository contains the [Node.js API Wrapper](https://github.com/Khubaib567/node-api-client-wrapper.git) for machine-to-machine authentication.

## Environment Variables Configuration

Create a `.env` file in the root directory of your project and configure the following variables:

```env
# Server Configuration
PORT=3000
PROXY_LOCALHOST="http://127.0.0.1:3000"

# SQL Server Configuration
DATABASE="DB_INSTANCE"
USER_NAME="USER_NAME"
PASSWORD="PASSWORD"
ACCESS_TOKEN="YOUR_SECRET_TOKEN"

# Redis Configuration
REDIS_URL="REDIS_SERVER_CONNECTION_URI"

# MongoDB Configuration
MONGODB_CONNECTION_URI="MONGODB_URI"

# PostgreSQL Configuration
POSTGRESQL_DATABASE_URL="POSTGRESQL_URI"

# Authorization Variables
ADMIN="ADMIN_KEY"

# Node-API Client Header Configuration
VAS_URL="SERVER_URL"
CONTENT_TYPE="CONTENT_TYPE"
USER_AGENT="USER_AGENT_NAME"
ORIGIN="ORIGIN_NAME"
X_FORWARDED_FOR="IP_ADDRESS"
X_REQUEST_ID="USER_REQUEST_ID"
X_USER_ROLE="USER_ROLE"

# Request Payload Configuration
ACTION_NAME="ACTION_NAME"
METHOD="METHOD_NAME"
HOSTNAME="HOST_NAME"
REMOTEADDRESS="REMOTE_ADDRESS"
IP="IP_ADDRESS"
```
