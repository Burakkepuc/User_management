const { PrismaClient } = require('@prisma/client');
const Response = require('../utils/response');
const handleErrorResponse = require('../utils/handleError');
const enums = require('../utils/enum')
const { createToken } = require('../middlewares/token');
const haversineDistance = require('haversine-distance');


const prismaClient = new PrismaClient();



const nearbyUsers = async (req, res) => {
  try {
    console.log('nearby users');
    const km = parseFloat(req.params.km); // URL'den mesafeyi al

    if (isNaN(km) || km <= 0) {
      return res.status(400).json({ error: "Invalid distance parameter. It must be a positive number." });
    }

    const userId = 1 || req.user.id; // Kullanıcının ID'sini JWT token veya başka bir yöntemle alabilirsiniz

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { location: true }
    });

    if (!user || !user.location) {
      return res.status(404).json({ error: "User or location not found." });
    }

    const userLocation = {
      latitude: user.location.latitude,
      longitude: user.location.longitude
    };

    // Tüm kullanıcıları ve konumlarını al
    const users = await prismaClient.user.findMany({
      where: {
        location: {
          NOT: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true
      }
    });

    // Filtrelenen kullanıcıları hesapla
    const filteredUsers = users.filter(otherUser => {
      if (!otherUser.location) return false;

      const otherUserLocation = {
        latitude: otherUser.location.latitude,
        longitude: otherUser.location.longitude
      };

      // Mesafe hesapla
      const distance = haversineDistance(
        userLocation,
        otherUserLocation
      );
      console.log(`Distance to user ${otherUser.id}: ${distance / 1000} km`); // Check distance

      return distance / 1000 <= km; // meters / km
    });

    res.status(200).json({
      success: true,
      data: filteredUsers
    });

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
};

module.exports = nearbyUsers;
