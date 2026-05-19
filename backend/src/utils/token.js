import jwt from "jsonwebtoken";

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev_secret_change_me", {
    expiresIn: "7d"
  });
