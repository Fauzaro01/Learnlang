const bcrypt = require("bcryptjs");

async function seedUsers(prisma) {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@learnlang.com" },
    update: {
      username: "admin",
      xp: 5000,
      energy: 5,
      energyNextRefillAt: null,
    },
    create: {
      name: "Admin LernLang",
      email: "admin@learnlang.com",
      password: adminPassword,
      username: "admin",
      bio: "Administrator platform LernLang",
      role: "ADMIN",
      xp: 5000,
      energy: 5,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  const users = [];
  const userSeeds = [
    {
      name: "Budi Santoso",
      email: "budi@example.com",
      username: "budi_santoso",
      bio: "Sedang belajar bahasa Inggris untuk karir",
      xp: 120,
      energy: 5,
      energyNextRefillAt: null,
    },
    {
      name: "Siti Nurhaliza",
      email: "siti@example.com",
      username: "siti_n",
      bio: "Pelajar bahasa Inggris yang antusias",
      xp: 260,
      energy: 5,
      energyNextRefillAt: null,
    },
    {
      name: "Andi Prasetya",
      email: "andi@example.com",
      username: "andi_p",
      bio: "Suka tantangan terjemahan",
      xp: 480,
      energy: 5,
      energyNextRefillAt: null,
    },
    {
      name: "Dewi Lestari",
      email: "dewi@example.com",
      username: "dewi_lestari",
      bio: "Belajar bahasa Inggris setiap hari",
      xp: 780,
      energy: 5,
      energyNextRefillAt: null,
    },
    {
      name: "Rizky Hidayat",
      email: "rizky@example.com",
      username: "rizky_h",
      bio: "English learner 🇬🇧",
      xp: 1050,
      energy: 5,
      energyNextRefillAt: null,
    },
  ];

  for (const u of userSeeds) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        username: u.username,
        bio: u.bio,
        xp: u.xp,
        energy: u.energy,
        energyNextRefillAt: u.energyNextRefillAt,
      },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        username: u.username,
        bio: u.bio,
        role: "USER",
        xp: u.xp,
        energy: u.energy,
        energyNextRefillAt: u.energyNextRefillAt,
      },
    });
    users.push(user);
    console.log(`✅ User: ${user.email}`);
  }

  return { admin, users };
}

module.exports = { seedUsers };
