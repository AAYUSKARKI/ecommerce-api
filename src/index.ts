import { server, logger } from "@/server";
import dotenv from "dotenv";

dotenv.config();

const backendserver = server.listen(process.env.PORT, () => {
	logger.info(`Server (${process.env.NODE_ENV}) running on port http://${process.env.HOST}:${process.env.PORT}`);
});

const onCloseSignal = () => {
	logger.info("sigint received, shutting down");
	backendserver.close(() => {
		logger.info("server closed");
		process.exit();
	});
	setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);