#!/bin/sh
set -e

# wait-for-postgres (simple loop)
if [ -n "$DATABASE_HOST" ]; then
  until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
    echo "Waiting for postgres..."
    sleep 1
  done
fi

# Run migrations and collectstatic
python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"