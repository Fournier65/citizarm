# Guide de déploiement : Replit → GitHub + OVH

Ce guide décrit comment migrer une application Replit vers un hébergement autonome sur un serveur OVH avec déploiement automatique via GitHub Actions.

---

## Rôles

- **IA** : prépare les fichiers de configuration, crée les workflows, corrige les erreurs
- **Humain** : exécute les commandes sur le serveur, clique dans les interfaces GitHub/OVH, fournit les secrets

---

## 1. Prérequis

### L'humain doit avoir :
- Un compte **GitHub**
- Un compte **OVH** (ou autre hébergeur VPS/dédié)
- Un **nom de domaine** avec accès à la gestion DNS
- Une clé **API Resend** (ou autre service email utilisé)

### L'IA vérifie :
- La structure du projet (`package.json`, scripts `build` et `start`)
- Le port utilisé par l'application (généralement `5000`)
- Le dossier de build (`dist/`, `dist/public/`, etc.)
- Les variables d'environnement nécessaires

---

## 2. L'IA prépare les fichiers de déploiement

L'IA crée les fichiers suivants dans le projet Replit :

### `Dockerfile`
Build multi-étapes : compilation du frontend (Vite) + backend (esbuild), puis image de production allégée.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
ENTRYPOINT ["./entrypoint.sh"]
```

> Les opérations de base de données sont exécutées explicitement depuis le dépôt sur le serveur, pas au démarrage du conteneur.

### `entrypoint.sh`
Lance l'application sans migration automatique (drizzle-kit push bloque en mode non-interactif) :

```sh
#!/bin/sh
set -e
echo "Starting application..."
exec node dist/index.cjs
```

### `docker-compose.yml`
Orchestre l'application + base de données PostgreSQL :

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: nomapp
      POSTGRES_USER: nomapp
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nomapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: always
    ports:
      - "PORT_HOTE:5000"
    environment:
      PGHOST: db
      PGPORT: "5432"
      PGUSER: nomapp
      PGDATABASE: nomapp
      PGPASSWORD: ${POSTGRES_PASSWORD}
      RESEND_API_KEY: ${RESEND_API_KEY}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

> ⚠️ Pour une **deuxième application** sur le même serveur, changer `PORT_HOTE` (ex: `5001:5000`) et les noms (`nomapp2`, `postgres_data2`).

### `nginx.conf`
Reverse proxy avec HTTPS et redirection www → non-www :

```nginx
server {
    listen 80;
    server_name mondomaine.fr www.mondomaine.fr;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://mondomaine.fr$request_uri; }
}

server {
    listen 443 ssl;
    server_name www.mondomaine.fr;
    ssl_certificate /etc/letsencrypt/live/mondomaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mondomaine.fr/privkey.pem;
    return 301 https://mondomaine.fr$request_uri;
}

server {
    listen 443 ssl;
    server_name mondomaine.fr;
    ssl_certificate /etc/letsencrypt/live/mondomaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mondomaine.fr/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    location / {
        proxy_pass http://localhost:PORT_HOTE;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### `.env.example`
```
POSTGRES_PASSWORD=changez_ce_mot_de_passe
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

### `.gitignore`
L'IA s'assure que `.env` est bien dans `.gitignore`.

---

## 3. L'humain connecte GitHub

1. Dans Replit : icône **Git** → connecter le compte GitHub → créer un repo (ex: `nomapp`)
2. Générer un **Personal Access Token** :
   - GitHub → Settings → Developer settings → Tokens (classic)
   - Cocher : ✅ `repo` et ✅ `workflow`
3. Dans le **Shell Replit**, pousser le code :
```bash
git remote add github https://UTILISATEUR:TOKEN@github.com/UTILISATEUR/nomapp.git
git push github main
```

> Le remote `github` sera utilisé pour tous les futurs pushs.

---

## 4. L'humain crée le serveur OVH

1. Choisir une image **Ubuntu 22.04 ou 24.04 LTS**
2. Récupérer l'IP et le mot de passe root par email OVH
3. Se connecter :
```bash
ssh ubuntu@IP_SERVEUR
```

> ⚠️ Ne jamais partager le mot de passe dans le chat.

---

## 5. L'humain configure le serveur

### Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### Installation de Docker
```bash
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker ubuntu
```
Se déconnecter puis se reconnecter, puis vérifier :
```bash
docker run hello-world
```

---

## 6. L'humain clone et configure le projet

```bash
cd /home/ubuntu
git clone https://github.com/UTILISATEUR/nomapp.git
cd nomapp
cp .env.example .env
nano .env
```

Remplir `.env` avec les vraies valeurs :
- `POSTGRES_PASSWORD` : inventer un mot de passe fort et le sauvegarder
- `RESEND_API_KEY` : récupérer sur resend.com → API Keys

---

## 7. L'humain configure le DNS

Dans le panneau DNS du registrar, pointer le domaine vers l'IP du serveur :
- Type `A`, nom `@`, valeur `IP_SERVEUR`
- Type `A`, nom `www`, valeur `IP_SERVEUR`

Vérifier la propagation sur : https://dnschecker.org/#A/mondomaine.fr

---

## 8. L'humain installe Nginx et obtient le certificat SSL

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Config Nginx temporaire (HTTP seulement, avant SSL) :
```bash
sudo tee /etc/nginx/sites-available/nomapp > /dev/null << 'EOF'
server {
    listen 80;
    server_name mondomaine.fr www.mondomaine.fr;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / {
        proxy_pass http://localhost:PORT_HOTE;
        proxy_set_header Host $host;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/nomapp /etc/nginx/sites-enabled/nomapp
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Obtenir le certificat (une fois le DNS propagé) :
```bash
sudo certbot --nginx -d mondomaine.fr -d www.mondomaine.fr
```

Ensuite, appliquer la config Nginx complète (avec HTTPS) depuis le fichier `nginx.conf` du projet.

---

## 9. L'humain lance l'application

```bash
cd /home/ubuntu/nomapp
docker compose --env-file .env up -d --build
```

Vérifier que tout tourne :
```bash
docker compose ps
docker logs nomapp-app-1
```

Tester : `https://mondomaine.fr`

### Initialiser la base OVH depuis la production Replit (une seule fois)

`docker compose up` crée le serveur PostgreSQL et sa base, **mais pas les tables**.
La production Replit et la base OVH sont distinctes. La commande `db:push` lancée
sur Replit ne modifie pas OVH. Le script `ops/db/import-ovh.sh` refuse de
continuer si l'une des deux tables existe déjà sur OVH : il ne fusionne pas
des données et ne les efface jamais.

Avant toute migration, changer tout mot de passe divulgué. Si la base OVH a déjà
été créée avec l'ancien mot de passe, changer le mot de passe **dans PostgreSQL**
avec `docker compose --env-file .env exec db psql -U citizarm -d citizarm`
puis `\password citizarm` (saisie masquée), et **ensuite** mettre la même valeur
dans `.env`. Modifier seulement `.env` ne change pas le mot de passe du rôle
enregistré dans le volume PostgreSQL. Ne jamais faire `docker compose down -v`.
Le conteneur `app` reçoit maintenant le mot de passe séparément via `PGPASSWORD` :
les caractères réservés aux URL, comme `#`, ne cassent plus la connexion.

1. Bloquer temporairement les nouvelles inscriptions/messages sur l'ancien site
   pendant l'export et la bascule, pour ne pas perdre les données arrivées entre
   l'export et la restauration. Prévoir une courte indisponibilité pour l'import.
2. Dans le Shell **Replit**, demander dans l'outil Database > Settings l'URL de
   connexion de **production** (pas celle de développement). Sans la partager
   dans le chat et sans la mettre dans Git, lancer :

   ```bash
   bash ops/db/export-replit-production.sh ../citizarm-replit-prod-data.dump
   ```

   Le script demande l'URL en saisie masquée et exporte seulement les deux
   tables métier, données incluses. Le fichier est créé hors du dépôt avec des
   permissions privées. Il contient des adresses et des messages personnels.
3. Transférer le fichier vers OVH par SSH (`scp`), hors du dépôt Git :

   ```bash
   scp ../citizarm-replit-prod-data.dump ubuntu@IP_SERVEUR:/home/ubuntu/
   ```

4. Après avoir mis à jour le code sur OVH **uniquement quand le déploiement est
   autorisé**, dans `/home/ubuntu/citizarm`, lancer :

   ```bash
   bash ops/db/import-ovh.sh /home/ubuntu/citizarm-replit-prod-data.dump
   docker compose --env-file .env up -d --build app
   ```

   Le script vérifie la cible, la présence des tables, la lisibilité de l'archive,
   puis sauvegarde la base OVH hors du dépôt **avant** de créer les tables. Il
   restaure uniquement les deux tables, ajuste leurs séquences et affiche les
   nombres de lignes. Si une étape échoue, s'arrêter et examiner l'erreur ; ne
   pas relancer aveuglément ni supprimer le volume.
5. Comparer les nombres de lignes avec ceux de la production Replit à l'heure
   de l'export, puis tester une seule inscription et un seul envoi de contact.
   L'enregistrement en base et l'envoi via Resend sont deux vérifications
   distinctes.

Ce transfert est **ponctuel**, pas une synchronisation continue. Ne jamais
ajouter `db:push`, `pg_restore` ou une création de tables à `entrypoint.sh`
ou à chaque déploiement automatique. Les changements ultérieurs de schéma
doivent être préparés et appliqués en migrations distinctes, après sauvegarde.

### Futures modifications de la base OVH (avant le code du site)

Le déploiement GitHub Actions copie le lanceur dans
`/home/ubuntu/migrate-ovh.sh`, mais ne lance **aucune** migration.
Pour chaque nouvelle table ou colonne, créer ou mettre à jour le fichier SQL
`ops/db/migrations/migration.sql` (toujours le même nom) et modifier
`shared/schema.ts` en accord avec lui.
Privilégier une modification compatible avec l'ancienne version du site
(nouvelle table, colonne nullable ou dotée d'une valeur par défaut). Pour
supprimer/renommer des éléments ou modifier des données existantes, prévoir
plusieurs étapes et une revue spécifique avant de toucher à la production.

1. Tester la migration hors production. Pousser **d'abord la migration seule** :
   le déploiement automatique reconstruit alors l'ancien site, sans changer
   la base. Attendre que le déploiement ait transféré le fichier sur OVH.
2. Depuis PowerShell sur le laptop, ouvrir une session SSH :

   ```powershell
   ssh ubuntu@ADRESSE_DU_SERVEUR
   ```

   Dans le terminal OVH, lancer le script installé par le déploiement :

   ```bash
   ~/migrate-ovh.sh
   ```

   Le raccourci `~/migrate` peut aussi être utilisé s'il a été créé. Le script
   lit directement le SQL publié, refuse une autre base ou un SQL déjà appliqué,
   crée une sauvegarde privée complète, la vérifie, puis exécute le SQL dans une
   transaction et enregistre son empreinte. **Seulement après succès**, il
   conserve une copie datée dans `/home/ubuntu/citizarm-migrations/`.
   Il laisse le fichier suivi par Git en place. En cas d'échec, la sauvegarde
   est conservée et le SQL publié reste disponible. **S'arrêter et examiner l'erreur**,
   sans publier le code qui dépend du nouveau schéma. Les sauvegardes sont
   dans `/home/ubuntu/citizarm-backups/` et contiennent des données privées.
3. Vérifier le résultat dans PostgreSQL/DBeaver, puis pousser le **code du
   site** : GitHub Actions le déploie sur OVH. Tester la fonctionnalité en
   production. Après le push sélectif de `./pubdb`, réaligner la branche `main`
   locale avant de lancer `./pub` ; ce dernier pousse tous les commits locaux.
   Conserver la sauvegarde selon une politique de rétention sûre.

Ne pas réutiliser `ops/db/import-ovh.sh` pour une mise à jour : il a servi
uniquement au transfert initial. Ne pas utiliser `docker compose down -v`.

### Maintenance Ubuntu du serveur OVH

Le déploiement installe `/home/ubuntu/restart`, sans l'exécuter. Depuis une
session SSH interactive, choisir un moment de faible trafic et lancer :

```bash
cd /home/ubuntu
./restart
```

Le script vérifie la cible PostgreSQL, réalise et vérifie une sauvegarde privée
dans `/home/ubuntu/citizarm-backups/`, puis lance `apt-get update` et
`apt-get upgrade` (avec confirmation des paquets par Ubuntu). Il ne redémarre
le serveur que si Ubuntu le demande, après une dernière confirmation. Un
redémarrage coupe le site et la session SSH. Après reconnexion, vérifier :

```bash
cd /home/ubuntu
./restart --check
```

Ce contrôle teste la base et l'application, sans relancer les mises à jour.
Une maintenance interrompue ou une sauvegarde non vérifiée n'entraîne aucun
redémarrage automatique. Ne pas utiliser `~/migrate` pour les mises à jour du
système. Conserver et protéger les sauvegardes, qui contiennent des données
personnelles.

### Vérifier l'envoi des emails en production

La clé Resend configurée dans Replit n'est **pas** transférée au serveur OVH ou à GitHub Actions.
Dans `/home/ubuntu/citizarm/.env` sur le serveur, définir `RESEND_API_KEY` avec une
clé valide depuis Resend (ne jamais la publier dans GitHub ni la coller dans un ticket).
Le fichier `.env` reste sur le serveur ; le déploiement GitHub utilise
`docker compose --env-file .env` pour transmettre la variable au conteneur.

Vérifier uniquement sa présence dans le conteneur, sans afficher sa valeur :

```bash
cd /home/ubuntu/citizarm
docker compose --env-file .env exec app sh -c 'if [ -n "$RESEND_API_KEY" ]; then echo "RESEND_API_KEY présente"; else echo "RESEND_API_KEY absente"; fi'
```

Après toute correction de `.env`, recréer le conteneur pour appliquer la variable :

```bash
docker compose --env-file .env up -d --force-recreate app
```

Après un essai via le formulaire de contact, examiner les seules lignes Resend :

```bash
docker compose --env-file .env logs --tail=100 app | grep '\[Resend\]'
```

Si la clé est présente mais que l'envoi échoue, vérifier le message d'erreur
Resend (clé invalide, permissions, domaine expéditeur `citizarm.fr`
non vérifié, etc.). Le formulaire enregistre le message dans la base avant
l'envoi : ne pas le soumettre plusieurs fois pour éviter les doublons.

---

## 10. L'IA configure le déploiement automatique (GitHub Actions)

L'IA crée `.github/workflows/deploy.yml` :

```yaml
name: Deploy to OVH

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/ubuntu/nomapp
            git pull origin main
            docker compose --env-file .env up -d --build
            docker image prune -f
```

### L'humain crée une clé SSH dédiée (sans passphrase) sur le serveur :
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/deploy_key  # copier ce contenu pour GitHub
```

### L'humain ajoute 3 secrets sur GitHub :
GitHub → repo → Settings → Secrets and variables → Actions → New repository secret

| Nom | Valeur |
|-----|--------|
| `SERVER_HOST` | IP du serveur |
| `SERVER_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | Contenu de `~/.ssh/deploy_key` (de `-----BEGIN` à `-----END`) |

---

## 11. Workflow de mise à jour (après setup)

Pour chaque modification du site :
1. Modifier le code dans Replit
2. Depuis le Shell Replit :
```bash
git push github main
```
3. GitHub Actions déploie automatiquement (~40 secondes)

---

## 12. Deuxième application sur le même serveur

Les étapes **4 à 6** (création serveur, Docker) sont déjà faites.

### Différences à appliquer :

**`docker-compose.yml`** : port hôte différent (ex: `5001:5000`), noms de volumes/services uniques

**Nginx** : ajouter un nouveau fichier de config pour le nouveau domaine :
```bash
sudo tee /etc/nginx/sites-available/nomapp2 > /dev/null << 'EOF'
server {
    listen 80;
    server_name mondomaine2.fr www.mondomaine2.fr;
    location / { return 301 https://mondomaine2.fr$request_uri; }
}
server {
    listen 443 ssl;
    server_name mondomaine2.fr;
    ssl_certificate /etc/letsencrypt/live/mondomaine2.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mondomaine2.fr/privkey.pem;
    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/nomapp2 /etc/nginx/sites-enabled/nomapp2
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mondomaine2.fr -d www.mondomaine2.fr
```

**Cloner et lancer** :
```bash
cd /home/ubuntu
git clone https://github.com/UTILISATEUR/nomapp2.git
cd nomapp2
cp .env.example .env && nano .env
docker compose --env-file .env up -d --build
```

---

## Pièges à éviter

| Problème | Cause | Solution |
|----------|-------|----------|
| Tables absentes sur OVH | `docker compose up` ne crée pas le schéma applicatif | Appliquer la procédure d'initialisation ci-dessus, une seule fois |
| Container en restart loop | `drizzle-kit push` bloque en non-interactif | `entrypoint.sh` ne doit PAS lancer drizzle-kit |
| `git pull` ne met pas à jour | Modifications locales sur le serveur | `git reset --hard origin/main && git pull` |
| Site non mis à jour après push | Cache Docker | `docker compose build --no-cache && docker compose up -d` |
| SSH GitHub Actions échoue | Clé avec passphrase | Créer une clé dédiée sans passphrase (`-N ""`) |
| Site affiche encore Replit | Propagation DNS locale | Vider le cache DNS ou tester sur mobile 4G |
