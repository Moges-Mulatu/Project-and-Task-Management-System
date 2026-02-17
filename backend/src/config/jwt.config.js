import dotenv from "dotenv";
dotenv.config();

export const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || "debo_default_secret",
    EXPIRES_IN: "1d",
};

export default JWT_CONFIG;
