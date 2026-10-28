#!/usr/bin/env bash
# Sobe o servidor de produção (.output, depois do `yarn build`) e confere que
# ele inicia e responde. Pega erros que o `vite dev` esconde, como dependência
# resolvida para a versão errada no bundle, que derrubam o servidor no boot.
# O banco é falso de propósito: as páginas renderizam com ErrorState e o teste
# não depende de rede nem de segredos.
set -euo pipefail

cd "$(dirname "$0")/.."

export PORT=${SMOKE_PORT:-3917}
export DATABASE_URL=postgresql://smoke:smoke@smoke.invalid/smoke
export BETTER_AUTH_SECRET=smoke-test-secret-not-used-anywhere-else
export BETTER_AUTH_URL=http://localhost:$PORT

node .output/server/index.mjs > smoke-server.log 2>&1 &
server=$!
trap 'kill $server 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  curl -s -o /dev/null "http://localhost:$PORT/" && break
  sleep 1
done

status=0
for path in / /about /admin/login /api/auth/get-session; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$path")
  echo "$path → $code"
  [ "$code" = 200 ] || status=1
done

if [ $status -ne 0 ]; then
  cat smoke-server.log
fi
exit $status
