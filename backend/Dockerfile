FROM n8nio/n8n:latest

USER root

RUN mkdir -p /n8n-community-nodes && \
    cd /n8n-community-nodes && \
    npm init -y && \
    npm install n8n-nodes-aws-sqs-extended

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node
