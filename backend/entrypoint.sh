#!/bin/sh
set -e

sed "s|\${GEMINI_API_KEY}|${GEMINI_API_KEY}|g;
     s|\${SUPABASE_URL}|${SUPABASE_URL}|g;
     s|\${SUPABASE_SERVICE_ROLE_KEY}|${SUPABASE_SERVICE_ROLE_KEY}|g;
     s|\${AWS_ACCESS_KEY_ID}|${AWS_ACCESS_KEY_ID}|g;
     s|\${AWS_SECRET_ACCESS_KEY}|${AWS_SECRET_ACCESS_KEY}|g;
     s|\${AWS_REGION}|${AWS_REGION}|g" \
  /credentials.template.json > /tmp/credentials.json

n8n import:credentials --skipDuplicates --input=/tmp/credentials.json
n8n import:workflow --separate --skipDuplicates --input=/workflows

exec n8n
