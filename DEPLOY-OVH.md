# CitiZarm — Guide de déploiement : Replit → GitHub + OVH

Ce guide décrit le déploiement de **CitiZarm** depuis Replit vers le dépôt
**`Fournier65/citizarm`**, puis vers le serveur OVH, avec déploiement automatique
via GitHub Actions. Les commandes et configurations ci-dessous utilisent les
noms de CitiZarm, pas des noms d'application fictifs.

> **Consigne pour l’IA d’un autre projet :** Cette documentation décrit le déploiement de référence de CitiZarm. Utilise-la comme exemple, pas comme une procédure à exécuter telle quelle. Le nouveau projet utilisera le même serveur OVH et un nouveau dépôt GitHub. Ne modifie ni les fichiers, ni les conteneurs, ni la base, ni les volumes, ni la configuration Nginx, ni les scripts de CitiZarm. Vérifie les ressources et ports disponibles, isole le nouveau projet et demande mon accord avant toute opération commune au serveur ou susceptible d’affecter CitiZarm. Crée une documentation propre au nouveau projet en adaptant les éléments indiqués en section 12 : remplacer le nom seul ne suffit pas.

## Repères CitiZarm

| Élément | Valeur utilisée pour CitiZarm |
|---------|------------------------------|
| Nom de l'application | `CitiZarm` |
| Identifiant technique | `citizarm` |
| Compte et dépôt GitHub | `Fournier65/citizarm` |
| Branche publiée | `main` |
| Remote Git dans Replit | `github` |
| Remote Git dans le clone OVH | `origin` |
| Compte Linux | `ubuntu` |
| Dossier de l'application sur OVH | `/home/ubuntu/citizarm` |
| Domaine | `citizarm.fr` et `www.citizarm.fr` |
| Port hôte et port de l'application | `5000:5000` |
| Base et rôle PostgreSQL | `citizarm` |
| Services Docker Compose | `app` et `db` |
| Volume logique PostgreSQL | `postgres_data`, dans le projet Compose CitiZarm |
| Configuration Nginx | `/etc/nginx/sites-available/citizarm` |
| Script source de migration | `ops/db/migrate-ovh.sh` |
| Copie pratique prévue par le déploiement | `/home/ubuntu/citizarm/migrate-ovh.sh` |
| Sauvegardes et archives SQL | `/home/ubuntu/citizarm-backups/` et `/home/ubuntu/citizarm-migrations/` |

`IP_SERVEUR` désigne l'adresse réelle du serveur OVH : elle est volontairement
à renseigner et n'est pas un nom d'application. Les valeurs de `.env.example`
sont des exemples, jamais des identifiants utilisables.

Les extraits de configuration correspondent aux fichiers du dépôt CitiZarm.
Une modification locale ne devient effective sur OVH qu'après sa publication
et un déploiement réussi. Le guide présente une seule procédure de configuration
et d'exploitation. Ne pas recréer les ressources existantes ni relancer l'import
sur une base contenant des données.

---

## Rôles

- **IA** : prépare les fichiers de configuration, crée les workflows, corrige les erreurs ; ne pousse vers GitHub qu'après accord explicite pour chaque publication
- **Humain** : exécute les commandes sur le serveur, clique dans les interfaces GitHub/OVH, fournit les secrets

---

## 1. Prérequis

### L'humain doit avoir :
- Le compte **GitHub `Fournier65`**, avec accès au dépôt `citizarm`
- Un compte **OVH** (ou autre hébergeur VPS/dédié)
- Le domaine **`citizarm.fr`**, avec accès à la gestion DNS
- Une clé **API Resend** (ou autre service email utilisé)

### L'IA vérifie :
- La structure du projet (`package.json`, scripts `build` et `start`)
- Le port utilisé par CitiZarm (`5000`)
- Le dossier de build (`dist/`, `dist/public/`, etc.)
- Les variables d'environnement nécessaires

---

## 2. L'IA prépare les fichiers de déploiement

Les fichiers suivants sont présents dans le projet Replit CitiZarm :

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
      POSTGRES_DB: citizarm
      POSTGRES_USER: citizarm
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U citizarm"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: always
    ports:
      - "5000:5000"
    environment:
      PGHOST: db
      PGPORT: "5432"
      PGUSER: citizarm
      PGDATABASE: citizarm
      PGPASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      RESEND_API_KEY: ${RESEND_API_KEY}
      SESSION_SECRET: ${SESSION_SECRET:-}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

Le port hôte `5000` est celui de CitiZarm. Pour un autre projet, choisir un
port hôte disponible et un projet Compose distinct ; voir la section 12.

### `nginx.conf`
Reverse proxy avec HTTPS et redirection www → non-www :

```nginx
server {
    listen 80;
    server_name citizarm.fr www.citizarm.fr;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://citizarm.fr$request_uri; }
}

server {
    listen 443 ssl;
    server_name www.citizarm.fr;
    ssl_certificate /etc/letsencrypt/live/citizarm.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/citizarm.fr/privkey.pem;
    return 301 https://citizarm.fr$request_uri;
}

server {
    listen 443 ssl;
    server_name citizarm.fr;
    ssl_certificate /etc/letsencrypt/live/citizarm.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/citizarm.fr/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1024;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### `.env.example`
```
POSTGRES_PASSWORD=changez_ce_mot_de_passe
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

### `.gitignore`
`.env` et les exports `*.dump` doivent rester ignorés par Git.
La copie générée `/migrate-ovh.sh` est aussi ignorée ; le script source
`ops/db/migrate-ovh.sh` reste suivi par Git.

---

## 3. L'humain connecte GitHub

Le dépôt CitiZarm est `https://github.com/Fournier65/citizarm`.
Le remote utilisé dans Replit s'appelle `github`. S'il n'existe pas, le créer :

```bash
git remote add github https://github.com/Fournier65/citizarm.git
```

Utiliser l'authentification Git déjà autorisée ou un gestionnaire
d'identifiants. Ne jamais placer de token dans l'URL du remote, la documentation
ou le chat. Après vérification des fichiers à publier et accord explicite :

```bash
git push github main
```

Après un push sélectif, vérifier et réaligner la branche locale avant un push
normal : celui-ci envoie tous les commits locaux, pas seulement le fichier voulu.

---

## 4. L'humain crée le serveur OVH

Créer le serveur uniquement s'il n'existe pas. Pour un deuxième projet sur
le même serveur, utiliser le serveur existant sans le réinstaller.

1. Choisir une image **Ubuntu 22.04 ou 24.04 LTS**
2. Récupérer l'IP et le mot de passe root par email OVH
3. Se connecter :
```bash
ssh ubuntu@IP_SERVEUR
```

> ⚠️ Ne jamais partager le mot de passe dans le chat.

---

## 5. L'humain configure le serveur

Installer les outils uniquement s'ils sont absents. Toute mise à jour ou tout
redémarrage du serveur peut affecter tous les sites hébergés et doit être
planifié avec l'humain.

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
git clone https://github.com/Fournier65/citizarm.git
cd citizarm
cp .env.example .env
nano .env
```

Remplir `.env` avec les vraies valeurs :
- `POSTGRES_PASSWORD` : inventer un mot de passe fort et le sauvegarder
- `RESEND_API_KEY` : récupérer sur resend.com → API Keys

Ne pas refaire ce clonage ni écraser le `.env` de CitiZarm sur son installation
existante. Pour un dépôt privé, le serveur doit disposer d'un accès de lecture
au dépôt pour le clonage et les futurs `git pull`. Cet accès est distinct de
la clé qui permet à GitHub Actions de se connecter au serveur.

---

## 7. L'humain configure le DNS

Dans le panneau DNS du registrar, pointer le domaine vers l'IP du serveur :
- Type `A`, nom `@`, valeur `IP_SERVEUR`
- Type `A`, nom `www`, valeur `IP_SERVEUR`

Vérifier la propagation sur : https://dnschecker.org/#A/citizarm.fr

---

## 8. L'humain installe Nginx et obtient le certificat SSL

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Config Nginx temporaire (HTTP seulement, avant SSL) :
```bash
sudo tee /etc/nginx/sites-available/citizarm > /dev/null << 'EOF'
server {
    listen 80;
    server_name citizarm.fr www.citizarm.fr;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/citizarm /etc/nginx/sites-enabled/citizarm
sudo nginx -t && sudo systemctl reload nginx
```

Obtenir le certificat (une fois le DNS propagé) :
```bash
sudo certbot --nginx -d citizarm.fr -d www.citizarm.fr
```

Ensuite, appliquer la config Nginx complète (avec HTTPS) depuis le fichier `nginx.conf` du projet.
Toujours obtenir le certificat avant d'activer une configuration qui référence
ses fichiers. Sur le serveur existant, ne pas remplacer la configuration
CitiZarm ni supprimer les autres sites Nginx pour installer un autre projet.

---

## 9. L'humain lance l'application

```bash
cd /home/ubuntu/citizarm
docker compose --env-file .env up -d --build
```

Vérifier que tout tourne :
```bash
docker compose ps
docker compose logs --tail=100 app
```

Tester : `https://citizarm.fr`

### Initialiser la base OVH depuis la production Replit (une seule fois)

Cette étape s'applique uniquement à une base cible sans tables métier.
Ne pas lancer l'import sur une base existante contenant ces tables.

`docker compose up` crée le serveur PostgreSQL et sa base, **mais pas les tables**.
La production Replit et la base OVH sont distinctes. La commande `db:push` lancée
sur Replit ne modifie pas OVH. Le script `ops/db/import-ovh.sh` refuse de
continuer si l'une des deux tables existe déjà sur OVH : il ne fusionne pas
des données et ne les efface jamais.

Avant toute migration, changer tout mot de passe divulgué. Pour une base
existante, changer le mot de passe **dans PostgreSQL**
avec `docker compose --env-file .env exec db psql -U citizarm -d citizarm`
puis `\password citizarm` (saisie masquée), et **ensuite** mettre la même valeur
dans `.env`. Modifier seulement `.env` ne change pas le mot de passe du rôle
enregistré dans le volume PostgreSQL. Ne jamais faire `docker compose down -v`.
Le conteneur `app` reçoit le mot de passe séparément via `PGPASSWORD` :
les caractères réservés aux URL, comme `#`, ne cassent plus la connexion.

1. Bloquer temporairement les nouvelles inscriptions/messages sur le site Replit
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

Le script source reste dans `ops/db/migrate-ovh.sh`. À chaque déploiement,
GitHub Actions crée ou met à jour une copie pratique et exécutable :
`/home/ubuntu/citizarm/migrate-ovh.sh`. Cette copie reste dans le dossier
CitiZarm, pas à la racine du compte Ubuntu. Le déploiement ne lance **aucune**
migration.
Pour chaque nouvelle table ou colonne, créer ou mettre à jour le fichier SQL
`ops/db/migrations/migration.sql` (toujours le même nom) et modifier
`shared/schema.ts` en accord avec lui.
Privilégier une modification compatible avec la version du site en service
(nouvelle table, colonne nullable ou dotée d'une valeur par défaut). Pour
supprimer/renommer des éléments ou modifier des données existantes, prévoir
plusieurs étapes et une revue spécifique avant de toucher à la production.

1. Tester la migration hors production. Pousser **d'abord la migration seule** :
   le déploiement automatique reconstruit alors le site en service, sans changer
   la base. Attendre que le déploiement ait transféré le fichier sur OVH.
2. Depuis PowerShell sur le laptop, ouvrir une session SSH :

   ```powershell
   ssh ubuntu@IP_SERVEUR
   ```

   Dans le terminal OVH, lancer le script du projet :

   ```bash
   cd ~/citizarm
   ./migrate-ovh.sh
   ```

   La copie est générée depuis le script source à chaque déploiement ;
   ne pas la modifier directement.

   Le script lit directement le SQL publié, refuse une autre base ou un SQL déjà appliqué,
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

Utiliser uniquement `migrate-ovh.sh` pour les évolutions du schéma.
`ops/db/import-ovh.sh` est réservé au transfert vers une base sans tables métier,
pas aux mises à jour. Ne pas utiliser `docker compose down -v` et ne pas
supprimer les dossiers de sauvegardes ou d'archives.

### Maintenance Ubuntu du serveur OVH

Le fichier source `restart` se trouve à la racine du dépôt CitiZarm.
Le déploiement le copie dans `/home/ubuntu/restart`, sans l'exécuter.
Ce script est une **maintenance du serveur**, pas un redémarrage limité
à l'application CitiZarm.

#### Ce que fait le script

Depuis une session SSH interactive, choisir un moment de faible trafic :

```bash
cd /home/ubuntu
./restart
```

1. Vérifie la présence du projet `/home/ubuntu/citizarm` et de son `.env`,
   l'accès administrateur Ubuntu et l'identité PostgreSQL `citizarm/citizarm`.
2. Sauvegarde **uniquement la base PostgreSQL `citizarm`**, via `pg_dump -Fc`,
   dans `/home/ubuntu/citizarm-backups/`. Les permissions des fichiers et du
   dossier sont privées.
3. Vérifie que l'archive est non vide et lisible avec `pg_restore`.
   Ce contrôle ne remplace pas un essai de restauration dans une base de test.
   Si la sauvegarde échoue ou n'est pas lisible, aucune mise à jour Ubuntu
   n'est lancée.
4. Exécute `apt-get update` puis `apt-get upgrade`, avec confirmation des
   paquets par Ubuntu. Ces opérations concernent **tout le serveur** et peuvent
   aussi redémarrer des services.
5. Si Ubuntu signale qu'un redémarrage est nécessaire, demande une confirmation.
   Seule une réponse affirmative déclenche `sudo reboot`. Ce redémarrage coupe
   **toutes les applications hébergées**, ainsi que la session SSH.
6. Si aucun redémarrage n'est nécessaire, vérifie la base et l'application
   CitiZarm. Après un redémarrage, lancer ce contrôle à la reconnexion :

```bash
cd /home/ubuntu
./restart --check
```

`--check` vérifie **uniquement CitiZarm** : accès PostgreSQL et réponse HTTP de
l'application dans son conteneur. Il ne sauvegarde rien, ne met pas Ubuntu à
jour et ne redémarre pas le serveur.

**Limite importante :** le script ne sauvegarde ni les bases des autres
applications, ni les rôles PostgreSQL, ni les fichiers applicatifs, volumes
de fichiers téléversés ou configurations du serveur. Ne pas interpréter
« sauvegarde vérifiée » comme une sauvegarde complète du serveur.

#### Comment étendre `restart` pour sauvegarder toutes les bases

L'adaptation ci-dessous doit être réalisée et testée **avant** d'utiliser
`restart` comme maintenance commune à plusieurs applications. Elle décrit
les modifications à apporter ; le script fourni ne les effectue pas encore.

1. **Recenser toutes les bases et leurs instances.** Pour chaque application,
   identifier le dossier du projet, le nom de projet Compose utilisé, le
   service PostgreSQL, le rôle autorisé, les bases à sauvegarder et un dossier
   privé de sauvegarde. CitiZarm utilise `/home/ubuntu/citizarm`, le service
   `db`, le rôle et la base `citizarm`, et `/home/ubuntu/citizarm-backups/`.
   Vérifier cet inventaire dans chaque instance PostgreSQL, pas seulement dans
   les fichiers Compose : une instance peut contenir plusieurs bases.
   Ne pas traiter deux références à la même instance/base comme deux cibles
   distinctes. Exclure seulement les bases techniques identifiées comme telles ;
   une base nommée `postgres` peut aussi contenir des données applicatives.
2. **Paramétrer les cibles dans le source `restart`.** Remplacer les variables
   uniques `project` et `backup_dir` par une liste de cibles explicites.
   Pour chaque cible, conserver le projet, le service, le rôle, le nom de base,
   le dossier de sauvegarde et les paramètres de contrôle de l'application.
   Ne pas mettre de mots de passe dans cette liste : conserver les identifiants
   dans les fichiers `.env` protégés propres aux projets.
3. **Adapter `db()` et les contrôles.** Chaque commande doit sélectionner le bon
   projet Compose, son `.env` et son service PostgreSQL, sans dépendre du
   dernier dossier courant. Remplacer les valeurs codées en dur `citizarm`
   dans les commandes `psql` et `pg_dump` par celles de la cible. Vérifier
   l'identité de chaque base et du rôle avant toute sauvegarde ; toute cible
   absente, ambiguë ou inaccessible doit provoquer un arrêt, pas être ignorée.
4. **Sauvegarder chaque base dans une boucle.** Pour chaque cible, créer une
   archive complète `pg_dump -Fc`, avec un nom comportant l'application, la base
   et la date. Conserver `umask 077`, des dossiers privés et le contrôle de
   lisibilité de chaque archive. Conserver les sauvegardes réussies si une
   cible suivante échoue, et identifier précisément les cibles en échec.
   Une base non PostgreSQL nécessite une procédure de sauvegarde adaptée à
   son moteur ; `pg_dump` ne la couvre pas.
5. **Sauvegarder les rôles nécessaires à une restauration.** Les archives
   `pg_dump` ne contiennent pas les rôles PostgreSQL. Prévoir, une fois par
   instance, un export protégé des objets globaux avec
   `pg_dumpall --globals-only`, au moyen d'un rôle disposant des permissions
   nécessaires, et tester sa restauration. Cet export peut contenir des
   données d'authentification : ne jamais l'afficher, le mettre dans Git ou le
   joindre à la documentation.
6. **Bloquer la maintenance tant que toutes les sauvegardes ne sont pas
   vérifiées.** Placer `apt-get update`, `apt-get upgrade` et la demande de
   redémarrage **après** la réussite de l'ensemble des sauvegardes et des
   contrôles. Si une seule cible échoue, arrêter le script avec un message
   clair, sans mettre Ubuntu à jour ni redémarrer.
7. **Étendre `check_services()` et `--check`.** Vérifier chaque base et chaque
   application après maintenance, avec son service et son port réels, et
   retourner un échec si une cible ne répond pas. Ne pas limiter la vérification
   au port interne `5000` ou à l'application CitiZarm.
8. **Tester puis publier le source de façon contrôlée.** Tester la restauration
   des archives dans des instances isolées, sans modifier les bases de
   production. Simuler aussi une base inaccessible et une sauvegarde échouée
   pour vérifier le blocage des mises à jour. Après accord explicite, publier
   le fichier source `restart` : le workflow CitiZarm mettra à jour
   `/home/ubuntu/restart`. Ne pas modifier seulement la copie sur le serveur,
   car elle serait remplacée au déploiement suivant. Les déploiements des autres
   applications ne doivent pas écraser ce script commun.

Chaque export PostgreSQL est cohérent pour sa base, mais plusieurs exports
successifs ne constituent pas une sauvegarde simultanée de toutes les bases.
Si des données doivent rester cohérentes entre plusieurs applications,
suspendre leurs écritures ensemble pendant la sauvegarde, avec l'accord de
l'humain. Prévoir aussi une copie protégée hors du serveur et une politique
de rétention : une sauvegarde stockée uniquement sur OVH ne protège pas d'une
perte du serveur.

Conserver une seule commande de maintenance, `./restart`, et un seul contrôle,
`./restart --check`, avec un périmètre clairement documenté après adaptation.
Ne pas utiliser `ops/db/migrate-ovh.sh` pour les mises à jour Ubuntu. Protéger
les sauvegardes, qui contiennent des données personnelles.

### Vérifier l'envoi des emails en production

Pour le modèle de newsletter et la désinscription, suivre `emails/README.md`.
Définir aussi un `SESSION_SECRET` stable dans le `.env` privé OVH avant tout
envoi de newsletter ou d'accusé de réception de contact ; il signe les liens et doit être conservé pour que les
emails déjà envoyés restent désinscriptibles. Cela ne nécessite pas de
migration SQL. Les notifications internes du formulaire de contact restent
distinctes et ne portent pas les en-têtes de désinscription.

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

Le fichier `.github/workflows/deploy.yml` du dépôt CitiZarm contient :

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
            set -e
            cd /home/ubuntu/citizarm
            git pull origin main
            install -m 700 ops/db/migrate-ovh.sh /home/ubuntu/citizarm/migrate-ovh.sh
            install -m 700 restart /home/ubuntu/restart
            docker compose --env-file .env up -d --build
            docker image prune -f
```

### L'humain crée une clé SSH dédiée (sans passphrase) sur le serveur :

Créer la clé uniquement si elle n'existe pas. Si `~/.ssh/deploy_key` existe, ne pas
l'écraser. Pour un autre projet, réutiliser un accès autorisé ou prévoir une
clé distincte avec l'accord de l'humain.

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/deploy_key  # copier ce contenu pour GitHub
```

### L'humain ajoute 3 secrets sur GitHub :
GitHub → dépôt `Fournier65/citizarm` → Settings → Secrets and variables → Actions → New repository secret

| Nom | Valeur |
|-----|--------|
| `SERVER_HOST` | IP du serveur |
| `SERVER_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | Contenu de `~/.ssh/deploy_key` (de `-----BEGIN` à `-----END`) |

### L'humain vérifie que GitHub Actions est autorisé :

Avant le premier push de déploiement, dans le dépôt `Fournier65/citizarm` :

1. Ouvrir **Settings → Actions → General**.
2. Dans **Actions permissions**, vérifier que GitHub Actions n'est pas
   désactivé et que la politique autorise **`appleboy/ssh-action@v1.0.3`**,
   utilisée par le workflow. Si les actions sont limitées à une liste,
   autoriser cette action en respectant la politique du dépôt ; il n'est pas
   nécessaire d'autoriser toutes les actions.
3. Enregistrer avec **Save** si un réglage a changé. Si une restriction est
   imposée par une organisation, demander à son administrateur de l'autoriser.
4. Vérifier que `.github/workflows/deploy.yml` est présent sur la branche
   **`main`** et que les trois secrets ci-dessus sont définis dans ce dépôt.
5. Après le push autorisé sur `main`, ouvrir l'onglet **Actions** et vérifier
   que **Deploy to OVH** s'est déclenché et termine avec le statut **Success**,
   puis vérifier `https://citizarm.fr`.

Si les permissions sont déjà correctes, ne pas les modifier. Un push sur une
autre branche ne déclenche pas ce workflow. Si aucun déploiement ne démarre,
vérifier la branche, la présence du workflow et les permissions avant de
relancer un push.

---

## 11. Workflow de mise à jour (après setup)

Pour chaque modification du site, après accord explicite de publication :
1. Modifier le code dans Replit
2. Depuis le Shell Replit :
```bash
git push github main
```
3. GitHub Actions déploie automatiquement ; attendre le succès du workflow
   `Deploy to OVH`, puis vérifier le site. La durée dépend du build.

---

## 12. Créer la documentation d'un autre projet à partir de CitiZarm

L'autre IA doit copier ce guide dans son propre projet et l'adapter, sans
modifier le déploiement CitiZarm. Les commandes des sections précédentes
ciblent CitiZarm : ne pas les exécuter telles quelles pour un nouveau site.

### Éléments à remplacer ou à vérifier

| Référence CitiZarm | Adaptation pour le nouveau projet |
|-------------------|-----------------------------------|
| `CitiZarm` / `citizarm` | Nom affiché et identifiant technique de la nouvelle application |
| `Fournier65/citizarm` | Nouveau dépôt ; conserver `Fournier65` si le compte GitHub reste le même |
| `/home/ubuntu/citizarm` | Dossier propre au nouveau projet, y compris dans le workflow et les scripts |
| `citizarm.fr`, `www.citizarm.fr` | Nouveau domaine et domaine expéditeur vérifié dans Resend |
| `/etc/nginx/sites-available/citizarm` et le lien dans `sites-enabled` | Nouveau fichier et nouveau lien Nginx ; ne pas remplacer ceux de CitiZarm |
| `/etc/letsencrypt/live/citizarm.fr/` | Certificat du nouveau domaine, créé avant d'activer HTTPS |
| Port hôte `5000` | Port libre différent ; adapter le port publié et la cible `proxy_pass` ensemble |
| Base et rôle PostgreSQL `citizarm` | Base, rôle et mot de passe propres au nouveau projet |
| Volume logique `postgres_data` | Volume isolé par un projet Compose distinct ; ne jamais utiliser le volume de CitiZarm |
| Scripts SQL et d'import | Schéma, tables, séquences et contrôles propres à la nouvelle application |
| Copie `citizarm/migrate-ovh.sh` | Copie pratique dans le dossier du nouveau projet, générée depuis son propre script |
| `citizarm-backups`, `citizarm-migrations`, `citizarm-replit-prod-data.dump` | Dossiers et fichier d'export propres au nouveau projet |
| Variables et secrets | Valeurs du nouveau projet ; ne pas recopier le `.env` de CitiZarm |

Le compte Linux `ubuntu`, l'adresse `IP_SERVEUR` et les outils déjà installés
restent communs si l'on utilise le même serveur. Le port interne `5000`, les
services `app` / `db` et le nom logique `postgres_data` peuvent être conservés
uniquement avec des projets Compose et des volumes réellement séparés.
Le framework, le build et le port interne doivent être vérifiés : les fichiers
Docker de CitiZarm ne conviennent pas forcément à une application différente.

### Ordre de travail pour l'autre IA

1. Examiner les ports, les ressources et les applications existantes, sans les
   modifier. Ne pas refaire la création du serveur ni l'installation de Docker.
2. Préparer le nouveau dépôt, ses fichiers et sa documentation avec les valeurs
   propres au projet. Adapter aussi les contrôles codés en dur dans les scripts :
   remplacer uniquement le nom dans ce guide ne modifie pas ces scripts.
3. Cloner le nouveau dépôt dans son propre dossier, créer son `.env` protégé et
   configurer l'accès de lecture Git ainsi que les secrets de son dépôt GitHub.
4. Préparer sa base et son schéma avec sauvegarde et vérifications. L'import
   CitiZarm concerne deux tables métier : il ne peut pas être réutilisé sans
   adaptation pour un autre schéma.
5. Ajouter un site Nginx HTTP distinct, configurer son DNS, obtenir son certificat,
   puis activer HTTPS. Valider Nginx avant chaque rechargement.
6. Vérifier les deux sites, l'accès à chaque base et l'envoi des emails.
   Prévoir une procédure de retour arrière limitée au nouveau projet.

Ne pas écraser `/home/ubuntu/restart`, ni réutiliser les sauvegardes, les
identifiants ou les volumes de CitiZarm. Les mises à jour Ubuntu, les
redémarrages et le nettoyage Docker sont communs au serveur : obtenir l'accord
de l'humain avant une opération susceptible d'affecter les autres applications.

---

## Pièges à éviter

| Problème | Cause | Solution |
|----------|-------|----------|
| Tables absentes sur OVH | `docker compose up` ne crée pas le schéma applicatif | Appliquer la procédure d'initialisation ci-dessus, une seule fois |
| Container en restart loop | `drizzle-kit push` bloque en non-interactif | `entrypoint.sh` ne doit PAS lancer drizzle-kit |
| `git pull` ne met pas à jour | Modifications locales sur le serveur | Examiner `git status` et sauvegarder les changements ; ne pas utiliser `git reset --hard` sans accord explicite |
| Site non mis à jour après push | Cache Docker | `docker compose build --no-cache && docker compose up -d` |
| SSH GitHub Actions échoue | Clé avec passphrase | Créer une clé dédiée sans passphrase (`-N ""`) |
| Site affiche encore Replit | Propagation DNS locale | Vider le cache DNS ou tester sur mobile 4G |
