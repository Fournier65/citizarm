#!/bin/sh
set -e

echo "Applying database migrations..."
npx drizzle-kit push --config=drizzle.config.ts

echo "Starting application..."
exec node dist/index.cjs
