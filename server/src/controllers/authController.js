const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const {
  signupSchema,
  loginSchema,
} = require("../validators/authValidator");

// REGISTER USER
const signup = async (req, res) => {
  try {
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details",
        errors: validation.error.flatten(),
      });
    }

    const {
      email,
      password,
      organizationName,
    } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      return tx.user.create({
        data: {
          email,
          passwordHash,
          organizationId: organization.id,
        },
        include: {
          organization: true,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        organization: user.organization.name,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

// LOGIN USER
const login = async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details",
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user.id;

      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        return res.json({
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            organization: user.organization.name,
          },
        });
      });
    });

  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
      select: {
        id: true,
        email: true,
        organizationId: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
    });
  }
};

// LOGOUT
const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("stockflow.sid", {
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
};

module.exports = {
  signup,
  login,
  getCurrentUser,
  logout,
};