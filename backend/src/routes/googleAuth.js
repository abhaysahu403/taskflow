const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { pool } = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential missing",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    const googleId = payload.sub;

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (users.length === 0) {
      const id = uuidv4();

      await pool.query(
        `INSERT INTO users
        (id, name, email, password, avatar, google_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          email,
          null,
          picture,
          googleId,
        ]
      );

      user = {
        id,
        name,
        email,
        avatar: picture,
        role: "user",
      };
    } else {
      user = users[0];
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
});

module.exports = router;