#!/bin/bash
# /scripts/001_init.sh
set -e
# Wait for MySQL socket to be ready
TRIES=0
until mysqladmin ping -h "localhost" --silent; do
  TRIES=$((TRIES+1))
  echo "Waiting for MySQL... ($TRIES)"
  if [ $TRIES -ge 30 ]; then
    echo "MySQL did not become ready in time"; exit 1
  fi
  sleep 2
done

# Run the SQL (idempotent)
mysql -uroot -prootpass <<'EOSQL'
CREATE DATABASE IF NOT EXISTS student_records CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_records;
SOURCE /docker-entrypoint-initdb.d/001_create_students.sql;
EOSQL

echo "Init script done."
