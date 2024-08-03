const { PrismaClient } = require('@prisma/client');
const Response = require('../utils/response');
const handleErrorResponse = require('../utils/handleError');
const enums = require('../utils/enum')
const { createToken } = require('../middlewares/token');
const haversineDistance = require('haversine-distance');
const { sendNotification } = require('../utils/webSocket');


const prismaClient = new PrismaClient();



const nearbyUsers = async (req, res) => {
  try {
    const km = parseFloat(req.params.km); // URL'den mesafeyi al

    if (isNaN(km) || km <= 0) {
      return handleErrorResponse(res, enums.HTTP_CODES.NOT_FOUND, "Invalid distance parameter.", "It must be a positive number.")
    }

    const userId = req.user.id;

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { location: true }
    });

    if (!user || !user.location) {
      return handleErrorResponse(res, enums.HTTP_CODES.NOT_FOUND, "Not Found", "User or location not found.")
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

    res.json(Response.successResponse(filteredUsers))

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
};



const likeUser = async (req, res) => {
  try {
    const { toUserId } = req.params;
    const userId = req.user.id;


    if (userId === parseInt(toUserId)) {
      return handleErrorResponse(res, enums.HTTP_CODES.BAD_REQUEST, "Error", "You Cannot like your profile.")
    }

    const existingLike = await prismaClient.like.findFirst({
      where: {
        fromUserId: userId,
        toUserId: parseInt(toUserId),
      },
    });

    if (existingLike) {
      return handleErrorResponse(res, enums.HTTP_CODES.BAD_REQUEST, "Already Liked", "You have already liked this user.")

    }

    const like = await prismaClient.like.create({
      data: {
        fromUserId: userId,
        toUserId: parseInt(toUserId),
      },
    });


    sendNotification(toUserId, { type: 'like', userId });

    res.json(Response.successResponse(like))
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
};

const dislikeUser = async (req, res) => {
  try {
    const { toUserId } = req.params;
    const userId = req.user.id;

    const existingLike = await prismaClient.like.findFirst({
      where: {
        fromUserId: userId,
        toUserId: parseInt(toUserId),
      },
    });

    if (!existingLike) {
      return handleErrorResponse(res, enums.HTTP_CODES.CONFLICT, "Didn't like", "You haven't  liked this user.");
    }

    await prismaClient.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    sendNotification(toUserId, { type: 'dislike', fromUserId: userId });


    res.json(Response.successResponse({ success: true }))
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
}

const getLikedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const likedUsers = await prismaClient.like.findMany({
      where: {
        fromUserId: userId
      },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            avatars: true
          }
        }
      }
    });


    const likedUserData = likedUsers.map(like => ({
      id: like.toUser.id,
      name: like.toUser.name,
      email: like.toUser.email,
      location: like.toUser.location,
      avatars: like.toUser.avatars
    }));

    res.json(Response.successResponse(likedUserData))

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
};

const getUsersWhoLikedMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const usersWhoLikedMe = await prismaClient.like.findMany({
      where: {
        toUserId: userId
      },
      select: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            location: {
              select: {
                latitude: true,
                longitude: true
              }
            },
            avatars: {
              select: {
                url: true
              }
            }
          }
        }
      }
    });

    res.json(Response.successResponse(
      usersWhoLikedMe.map(like => like.fromUser)
    ))

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body;

    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return handleErrorResponse(res, enums.HTTP_CODES.BAD_REQUEST, "Not Found", "User Not Found.")
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json(Response.successResponse(updatedUser))
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
}


module.exports = { nearbyUsers, likeUser, dislikeUser, getLikedUsers, getUsersWhoLikedMe, updateProfile }; 
