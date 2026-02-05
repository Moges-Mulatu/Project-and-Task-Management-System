import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 3003,
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "project_management",
    DB_PORT: process.env.DB_PORT || 3308,
    JWT_SECRET: process.env.JWT_SECRET || "debo_default_secret",
};

export default ENV;
