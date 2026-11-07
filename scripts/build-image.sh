#!/bin/sh
# Build an amd64 image and save it as dist/record-playtime-tracker-<sha>.tar.gz
set -e
cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain)" ] && [ -z "$FORCE" ]; then
  echo "Working tree is dirty; commit or run with FORCE=1" >&2; exit 1
fi
SHA=$(git rev-parse --short HEAD)
OUT=dist/record-playtime-tracker-$SHA.tar.gz
mkdir -p dist
docker buildx build --platform linux/amd64 \
  -t record-playtime-tracker:"$SHA" -t record-playtime-tracker:latest \
  -o type=docker,dest=- . | gzip > "$OUT"
echo "Built $OUT"
echo "Deploy:"
echo "  scp $OUT deploy/docker-compose.yaml deploy/.env.example user@server:~/record-playtime-tracker/"
echo "  ssh user@server 'cd ~/record-playtime-tracker && gunzip -c $(basename "$OUT") | docker load && APP_TAG=$SHA docker compose up -d'"
