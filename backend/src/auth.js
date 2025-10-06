require("dotenv").config({ path: "../.env" });
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticateToken = require("./verifyToken");
app.use(express.json());

router.post("/Signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      }
    });

    const token = jwt.sign({ id: newUser.id }, process.env.TOKEN, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Signup successful",
      user: { username, email },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await prisma.user.findUnique({ where: { email } });
    if (!userData) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: userData.id }, process.env.TOKEN, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: userData.id,
        name: userData.username,
        email: userData.email,
      }, token
    }); 

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server issue" });
  }
});

router.post("/vaultSignup", async (req, res) => {
  const { vaultId, vaultPassword } = req.body;

  try {
    // const existingUser = await prisma.vault.findUnique({ where: { vaultId } });
    // if (existingUser) {
    //   return res.status(409).json({ message: "User already exists" });
    // }

    const hashedPassword = await bcrypt.hash(vaultPassword, 10); // Fixed: vaultPassword
    const newUser = await prisma.vaultItem.create({ 
      data: {
        vaultId,
        vaultPassword: hashedPassword,
      }
    });

    return res.status(200).json({
      message: "Signup successful",
      vaultUser: { vaultId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/vaultLogin", async (req, res) => {
  const { vaultId, vaultPassword } = req.body;

  try {
    const userData = await prisma.vault.findUnique({ where: { vaultId } });
    if (!userData) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(vaultPassword, userData.vaultPassword); // Fixed: vaultPassword
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      user: {
        vaultId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server issue" });
  }
});


// Get user's vault items
router.get("/vault/items", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const vaultItems = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(vaultItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new vault item
router.post("/vault/items", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { encryptedData } = req.body;

    const vaultItem = await prisma.vaultItem.create({
      data: {
        userId,
        encryptedData
      }
    });

    res.status(201).json(vaultItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete vault item
router.delete("/vault/items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.vaultItem.deleteMany({
      where: {
        id,
        userId
      }
    });

    res.json({ message: "Vault item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;