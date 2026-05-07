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

echo "▶  Enviando binário da API..."
scp backend/api "$VPS_USER@$VPS_IP:$VPS_DIR/api"

echo "▶  Reiniciando serviço..."
ssh "$VPS_USER@$VPS_IP" "chmod +x $VPS_DIR/api && systemctl restart bymatheus-api"

echo "✅  Deploy concluído → https://www.bymatheus.com.br"
echo "    (bymatheus.com.br sem www continua apontando para o site de casamento)"
