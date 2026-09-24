# Futures migrations OVH

Le fichier SQL à publier portera toujours le même nom :
`ops/db/migrations/migration.sql`. Lors d'une nouvelle évolution, remplacer
son contenu, publier d'abord **uniquement ce fichier**, puis sur OVH lancer
`/home/ubuntu/migrate-ovh.sh`. Le lanceur lit le SQL publié et conserve une
copie dans `/home/ubuntu/citizarm-migrations/` avec une date dans le nom
après succès. Il ne renomme pas le fichier suivi par Git. Les anciennes versions
restent aussi dans l'historique Git ; la base enregistre l'empreinte de chaque
migration appliquée.

Écrire du SQL compatible avec l'ancienne version du site pendant la transition.
Ne pas inclure `BEGIN`, `COMMIT`, `ROLLBACK` ou des commandes `psql` : le lanceur
fournit la transaction. Les opérations qui ne peuvent pas être exécutées dans
une transaction nécessitent une procédure spécifique.

La migration initiale (`ops/db/001_initial.sql`) et l'import des données Replit
ont déjà été exécutés sur OVH. Ne pas les relancer.