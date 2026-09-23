# Futures migrations OVH

Ajouter ici une migration SQL par évolution de schéma, avec un nom tel que
`0002_add_example_table.sql`, puis `0003_add_example_column.sql`.

Ces fichiers doivent être compatibles avec l'ancienne version du site pendant
la transition. Ne pas inclure `BEGIN`, `COMMIT`, `ROLLBACK` ou des commandes
`psql` : `migrate-ovh.sh` fournit une transaction et note chaque migration
appliquée. Ne pas renommer ou modifier une migration déjà exécutée.

La migration initiale (`ops/db/001_initial.sql`) et l'import des données Replit
ont déjà été exécutés sur OVH. Ne pas les relancer.