#!/bin/bash
set -e

# ─── Configuração ────────────────────────────────────────────────
VPS_IP="147.93.41.46"
VPS_USER="root"
VPS_DIR="/var/www/bymatheus"
# ─────────────────────────────────────────────────────────────────

if [ "$VPS_IP" = "SEU_IP_AQUI" ]; then
  echo "❌  Edite o deploy.sh e preencha VPS_IP antes de continuar."
  exit 1
fi

echo "▶  Build do frontend..."
npm run build

echo "▶  Build do backend (linux/amd64)..."
cd backend
GOOS=linux GOARCH=amd64 go build -o api .
cd ..

echo "▶  Enviando frontend..."
scp -r dist/* "$VPS_USER@$VPS_IP:$VPS_DIR/public/"

echo "▶  Parando serviço..."
ssh "$VPS_USER@$VPS_IP" "systemctl stop bymatheus-api"

echo "▶  Enviando binário da API..."
scp backend/api "$VPS_USER@$VPS_IP:$VPS_DIR/api"

echo "▶  Verificando Calibre no servidor..."
ssh "$VPS_USER@$VPS_IP" "which ebook-convert > /dev/null 2>&1 || (apt-get install -y --no-install-recommends calibre 2>&1 | tail -5 && echo '✅ Calibre instalado')"

echo "▶  Reiniciando serviço..."
ssh "$VPS_USER@$VPS_IP" "chmod +x $VPS_DIR/api && systemctl start bymatheus-api"

echo "✅  Deploy concluído → https://www.bymatheus.com.br"
