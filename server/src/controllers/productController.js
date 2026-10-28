const prisma = require("../config/prisma");

const {
  productSchema,
  updateProductSchema,
} = require("../validators/productValidator");

// CREATE PRODUCT
const createProduct = async (req, res, next) => {
  try {
    const validation = productSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details",
        errors: validation.error.issues,
      });
    }

    const organizationId = req.user.organizationId;

    const product = await prisma.product.create({
      data: {
        ...validation.data,
        organizationId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    next(error);
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res, next) => {
  try {
    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details",
        errors: validation.error.issues,
      });
    }

    const organizationId = req.user.organizationId;

    const result = await prisma.product.updateMany({
      where: {
        id: req.params.id,
        organizationId,
      },
      data: validation.data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        organizationId,
      },
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    next(error);
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
  try {
    const result = await prisma.product.deleteMany({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};