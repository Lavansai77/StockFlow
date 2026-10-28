const prisma = require("../config/prisma");

const getDashboardStats = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;

    // Fetch organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        defaultLowStockThreshold: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Retrieve products belonging to this organization
    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate inventory statistics
    const totalProducts = products.length;

    const totalStockUnits = products.reduce(
      (total, product) => total + product.quantityOnHand,
      0
    );

    const lowStockProducts = products.filter((product) => {
      const threshold =
        product.lowStockThreshold ??
        organization.defaultLowStockThreshold;

      return product.quantityOnHand <= threshold;
    });

    const recentProducts = products.slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalStockUnits,
        lowStockItems: lowStockProducts.length,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        defaultLowStockThreshold:
          organization.defaultLowStockThreshold,
      },
      recentProducts,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };