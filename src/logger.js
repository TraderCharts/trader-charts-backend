import winston from "winston";
import fs from "fs";
import { DateTime } from "luxon";

if (!fs.existsSync("logs")) fs.mkdirSync("logs");

const rawFormat = winston.format.printf(({ message }) => message);

// SQL Logger
export const sqlLogger = winston.createLogger({
    level: "info",
    format: rawFormat,
    transports: [
        // Archivo (⚡ mantiene los códigos ANSI)
        new winston.transports.File({
            filename: "logs/sql.log",
            level: "info",
            options: { flags: "a", encoding: "utf8" },
        }),
    ],
});

export const sequelizeLogger = (msg) => {
    const sql = msg.replace(/^Executing \(default\): /, "").trim();
    const timestamp = DateTime.now().toFormat("dd-MM-yyyy HH:mm:ss ZZZZ");
    const line = `${timestamp} | ${sql}`;

    sqlLogger.info(line);
};

// Logger app
export const appLogger = winston.createLogger({
    level: "info",
    transports: [
        // Consola con colores
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message }) => `[${level}] ${message}`)
            ),
        }),

        // Archivo sin colores
        new winston.transports.File({
            filename: "logs/app.log",
            level: "info",
            format: rawFormat,
        }),
    ],
});
