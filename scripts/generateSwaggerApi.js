import expressOasGenerator from "express-oas-generator";
import "./src/loadDotEnv.js";
import app from "../src/controllers/index.js";
import loadDefaultSwaggerSpecs from "./loadDefaultSwaggerSpecs.js";

loadDefaultSwaggerSpecs();

app.set("PORT", process.env.PORT || 3002);
app.set("HOST", process.env.HOST || "localhost");

const afterRun = function () {
    const host =
        server.address().address !== "::" ? server.address().address === "::" : app.get("HOST");
    const port = server.address().port;

    console.log("\nTrading charts Backend listening at http://%s:%s\n", host, port);
};

expressOasGenerator.handleRequests();
const server = app.listen(app.get("PORT"), afterRun);
