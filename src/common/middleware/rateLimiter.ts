import type { Request } from "express";
import { rateLimit } from "express-rate-limit";

const maxRequests = process.env.COMMON_RATE_LIMIT_MAX_REQUESTS
  ? Number(process.env.COMMON_RATE_LIMIT_MAX_REQUESTS)
  : 100; // Default to 100 requests if undefined

const windowMs = process.env.COMMON_RATE_LIMIT_WINDOW_MS
  ? Number(process.env.COMMON_RATE_LIMIT_WINDOW_MS)
  : 1000; // Default to 1000ms (1 second) if undefined
const rateLimiter = rateLimit({
	legacyHeaders: true,
	limit: maxRequests,
	message: "Too many requests, please try again later.",
	standardHeaders: true,
	windowMs: 15 * 60 * windowMs,
	keyGenerator: (req: Request) => req.ip as string,
});

export default rateLimiter;