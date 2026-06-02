#!/bin/bash
set -e

echo "=== Setup CitiZarm sur le serveur ==="

# 1. Installer Nginx et Certbot
echo "[1/6] Installation de Nginx et Certbot..."
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Cloner le projet
echo "[2/6] Clonage du projet..."
cd /home/ubuntu
git clone https://github.com/VOTRE_COMPTE/citizarm.git
cd citizarm

# 3. Créer le fichier .env
echo "[3/6] Configuration des variables d'environnement..."
cp .env.example .env
echo ""
echo ">>> Editez le fichier .env avec vos vraies valeurs :"
echo "    nano .env"
echo "    (POSTGRES_PASSWORD et RESEND_API_KEY)"
echo ""
read -p "Appuyez sur ENTRÉE quand c'est fait..."

# 4. Copier la config Nginx
echo "[4/6] Configuration de Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/citizarm
sudo ln -sf /etc/nginx/sites-available/citizarm /etc/nginx/sites-enabled/citizarm
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Certificat SSL
echo "[5/6] Certificat SSL (Let's Encrypt)..."
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d citizarm.fr -d www.citizarm.fr --non-interactive --agree-tos -m contact@citizarm.fr

# 6. Lancer l'app avec Docker Compose
echo "[6/6] Démarrage de l'application..."
docker compose --env-file .env up -d --build

echo ""
echo "=== Terminé ! ==="
echo "Votre site est disponible sur https://citizarm.fr"
echo ""
echo "Commandes utiles :"
echo "  docker compose logs -f        # voir les logs"
echo "  docker compose restart        # redémarrer"
echo "  docker compose down           # arrêter"
