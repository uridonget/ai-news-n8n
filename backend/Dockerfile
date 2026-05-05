FROM n8nio/n8n:latest

# Switch to root to install additional tools if needed
USER root

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node
