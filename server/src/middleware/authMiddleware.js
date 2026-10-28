const prisma = require("../config/prisma");

const requireAuth = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
      select: {
        id: true,
        email: true,
        organizationId: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    next(error);
  }
};

module.exports = requireAuth;