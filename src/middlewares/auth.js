import { auth } from "express-oauth2-jwt-bearer";

const checkJwt = auth({
    issuerBaseURL: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
});

export default checkJwt;
