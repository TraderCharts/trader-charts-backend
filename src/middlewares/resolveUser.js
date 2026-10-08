import { appLogger } from "../logger";
import { getUserBySub } from "../managers/mongodb/User";

const resolveUser = async (req, res, next) => {
    try {
        // FUTURE: once checkJwt is enabled, use:
        // const sub = req.auth.payload.sub;

        // TEMPORARY: remove this block when checkJwt is enabled.
        const sub = req.get("X-User-Sub");

        if (!sub) {
            return res.status(401).json({
                error: "User identity required",
            });
        }

        const user = await getUserBySub(sub);

        if (!user) {
            return res.status(401).json({
                error: "User not found",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        appLogger.error("Error resolving user:", error);

        return res.status(500).json({
            error: error.message,
        });
    }
};

export default resolveUser;
