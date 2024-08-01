const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt')


const prisma = new PrismaClient();

const generateRandomLatitude = () => Math.random() * (90 - (-90)) + (-90);
const generateRandomLongitude = () => Math.random() * (180 - (-180)) + (-180);

const createTestUsers = async () => {
  try {
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const name = `Test User ${i}`;
      const email = `testuser${i}@example.com`;
      const password = 'test123';
      const latitude = generateRandomLatitude();
      const longitude = generateRandomLongitude();

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          location: {
            create: {
              latitude,
              longitude
            }
          },
        },
      });

      users.push(user);
    }

    console.log('Kullanıcılar başarıyla oluşturuldu:', users);
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
};

createTestUsers();
