const prisma = require("../config/prisma");

const {
  settingsSchema,
} = require("../validators/settingsValidator");

// GET ORGANIZATION SETTINGS
const getSettings = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
        createdAt: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      organization,
      user: {
        id: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE ORGANIZATION SETTINGS
const updateSettings = async (req, res, next) => {
  try {
    const validation = settingsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization settings",
        errors: validation.error.issues,
      });
    }

    const organizationId = req.user.organizationId;

    const organization = await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        defaultLowStockThreshold:
          validation.data.defaultLowStockThreshold,
      },
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Organization settings updated successfully",
      organization,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};