#!/bin/sh
# Show or hide an app's sidebar entry ("Show in sidebar" = ingress_panel) via the Supervisor API.
# Usage: ingress_panel.sh <app slug> <true|false>
# Runs inside the Home Assistant container, which provides SUPERVISOR_TOKEN.
slug="$1"
show="$2"

# only plain slugs (letters, digits, _ and -) and true/false are accepted
case "$slug" in
  ""|*[!a-z0-9_-]*) echo "invalid app slug: $slug" >&2; exit 2 ;;
esac
case "$show" in
  true|false) ;;
  *) echo "second argument must be true or false" >&2; exit 2 ;;
esac

curl -sS -f -X POST \
  -H "Authorization: Bearer ${SUPERVISOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"ingress_panel\": ${show}}" \
  "http://supervisor/addons/${slug}/options"
