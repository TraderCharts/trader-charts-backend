import "../loadDotEnv";
import app from "./controllers";

const afterRun = function () {
    const host =
        server.address().address !== "::" ? server.address().address === "::" : app.get("HOST");
    const port = server.address().port;

    console.log("\nTrading charts Backend listening at http://%s:%s\n\n", host, port);
};

app.set("PORT", process.env.PORT || 3000);
app.set("HOST", process.env.HOST || "localhost");
const server = app.listen(app.get("PORT"), afterRun);
