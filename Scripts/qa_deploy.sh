# #!/bin/bash
# set -e

# # ---------- CONFIG ----------
# ENVIRONMENT="$1"
# BACKEND_TAG="$2"
# # ----------------------------

# # Resolve paths
# SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# REPO_ROOT="$(dirname "$SCRIPT_DIR")"
# DEPLOY_PATH="/home/bengaluru//docker-files/nurovision_QA/backend"
# COMPOSE_FILE="compose/docker-compose-${ENVIRONMENT}.yml"
# PROJECT_NAME="nurovision_backend_${ENVIRONMENT}"
# REMOTE_ENV_FILE="Environment/.env.${ENVIRONMENT}"

# # Basic validation
# if [[ -z "$BACKEND_TAG" ]]; then
#     echo "Error: BACKEND_TAG not provided"
#     echo "Usage: $0 <environment> <docker_tag>"
#     exit 1
# fi

# # Static remote server config (customize if needed)
# QA_SSH_USER="root"
# QA_SSH_HOST="10.10.110.168"
# QA_SSH_PORT="7722"
# export QA_SSH_PORT

# echo "Environment: $ENVIRONMENT"
# echo "Docker Tag: $BACKEND_TAG"
# echo "SSH: $QA_SSH_USER@$QA_SSH_HOST"

# # Execute deployment on remote host
# echo "=== Starting Production Deployment ==="
# "$SCRIPT_DIR/SSH_connect.sh" "$QA_SSH_USER" "$QA_SSH_HOST" "
#     set -e
#     cd $DEPLOY_PATH 

#     echo 'Updating tags in env file...'
#     sed -i \"s/^IMAGE_TAG=.*/IMAGE_TAG=${BACKEND_TAG}/\" $REMOTE_ENV_FILE
#     sed -i \"s/^BACKEND_VERSION=.*/BACKEND_VERSION=${BACKEND_TAG}/\" $REMOTE_ENV_FILE

#    echo 'Stopping existing services...'
#   docker compose -p $PROJECT_NAME --env-file $REMOTE_ENV_FIILE -f $COMPOSE_FILE down

#   echo 'Pulling updated image...'
#   docker compose -p $PROJECT_NAME --env-file $REMOTE_ENV_FILE -f $COMPOSE_FILE pull

#   echo 'Starting containers...'
#   docker compose -p $PROJECT_NAME --env-file $REMOTE_ENV_FILE -f $COMPOSE_FILE up -d

#   echo 'Production deployment complete.'
#   docker compose -p $PROJECT_NAME --env-file $REMOTE_ENV_FILE -f $COMPOSE_FILE  ps 
# "


