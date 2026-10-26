#!/bin/sh
set -e

echo "==> Menunggu database siap..."
# Format DATABASE_URL: mysql://user:pass@host:port/dbname
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's#^.*@([^:/]+).*$#\1#')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's#^.*:([0-9]+)/.*$#\1#')

if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DATABASE_URL" ]; then
  DB_PORT=3306
fi

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "==> Database terhubung di $DB_HOST:$DB_PORT"

echo "==> Menyiapkan schema database..."
npx prisma db push --skip-generate

echo "==> Cek apakah database perlu di-seed..."
node -e '
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.user.count();
  if (count === 0) {
    console.log("==> Database kosong, menjalankan seed...");
    const { execSync } = require("child_process");
    execSync("npm run db:seed", { stdio: "inherit" });
  } else {
    console.log("==> Database sudah berisi data, lewati seed.");
  }
  await prisma.$disconnect();
}
check().catch((e) => {
  console.error(e);
  process.exit(0);
});
'

echo "==> Menjalankan aplikasi..."
exec "$@"
