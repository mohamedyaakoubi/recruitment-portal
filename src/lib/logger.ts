type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";

const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

export const logger = {
    debug: (message: string, context?: LogContext): void => {
        if (isDevelopment) {
            console.debug(formatMessage("debug", message, context));
        }
    },

    info: (message: string, context?: LogContext): void => {
        if (isDevelopment) {
            console.info(formatMessage("info", message, context));
        }
    },

    warn: (message: string, context?: LogContext): void => {
        console.warn(formatMessage("warn", message, context));
    },

    error: (message: string, error?: unknown, context?: LogContext): void => {
        const errorContext = {
            ...context,
            error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        };
        console.error(formatMessage("error", message, errorContext));
    },

    // For API routes - always log in production for monitoring
    api: {
        request: (method: string, path: string, context?: LogContext): void => {
            console.info(formatMessage("info", `API ${method} ${path}`, context));
        },
        response: (method: string, path: string, status: number, duration: number): void => {
            console.info(formatMessage("info", `API ${method} ${path} -> ${status} (${duration}ms)`));
        },
        error: (method: string, path: string, error: unknown): void => {
            logger.error(`API ${method} ${path} failed`, error);
        },
    },
};

export default logger;
