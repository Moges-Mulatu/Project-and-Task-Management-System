import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Fail startup if JWT_SECRET is missing in production
if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required in production');
}

export const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || (isProduction ? null : "debo_default_secret"),
    EXPIRES_IN: "1d",
};

export default JWT_CONFIG;
