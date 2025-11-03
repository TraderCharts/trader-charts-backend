const { SPEC_OUTPUT_FILE_BEHAVIOR } = require("express-oas-generator");
const fs = require("fs");
const path = require("path");

const swaggerConfig = {
    specOutputPath: path.resolve(__dirname, "../docs/specs/swagger_runtime.json"),
    alwaysServeDocs: true,
    specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.RECREATE,
    tags: [
        "users",
        "photos",
        "upload",
        "indicators",
        "alerts",
        "alertConditionExpressions",
        "alertConditionOperations",
        "negotiableInstruments",
        "negotiableInstrumentTypes",
        "bymaStocksData",
        "trendingNews",
    ],
    predefinedSpec: (spec) => {
        spec.info = {
            ...spec.info,
            title: "Trader Charts API Documentation",
            version: "3.0.0",
            contact: {
                name: "Gonzalo Sanchez Cano",
                url: "https://github.com/sgonzaloc",
                email: "gonzalo.sanchezcano@gmail.com",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
            },
            description: `<div>
        <p>This page contains the documentation on how to use Discourse through API calls.</p>
        <blockquote>
          <p>⚠️ Note: If you add new endpoints, please update the swagger API Oficial documentation</p>
        </blockquote>
        <h3><em> *** One charting tool to rule them all *** </em></h3>
      </div>`,
            "x-logo": {
                url: "https://avatars.githubusercontent.com/u/235483245?u=f1859a88b3e3c9d1b5a5857079c364d3746a1ad9",
                altText: "Trader Charts",
                href: "https://github.com/TraderCharts",
            },
        };
        spec["x-redoc"] = {
            theme: {
                colors: {
                    primary: { main: "#2563eb" },
                    text: { primary: "#1f2937", secondary: "#6b7280" },
                    http: {
                        get: "#22c55e",
                        post: "#3b82f6",
                        put: "#eab308",
                        delete: "#ef4444",
                    },
                },
                typography: {
                    fontFamily: "Inter, sans-serif",
                    headings: {
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: "600",
                    },
                },
                menu: { backgroundColor: "#f9fafb", textColor: "#111827" },
                rightPanel: { backgroundColor: "#f8fafc" },
            },
        };
        return spec;
    },
    swaggerDocumentOptions: {
        customCss: fs.readFileSync(
            path.resolve(__dirname, "../docs/assets/swaggerUI_custom.css"),
            "utf8"
        ),
        customSiteTitle: "Trader Charts API 🚀 ",
        customfavIcon: "/assets/img/logo/traderChartsLogo.v3.optimized512x512.ico",
        swaggerOptions: {
            docExpansion: "list",
            filter: true,
            displayRequestDuration: true,
            persistAuthorization: true,
            tryItOutEnabled: true,
            showExtensions: true,
            syntaxHighlight: {
                activate: true,
                theme: "dracula",
            },
        },
    },
};

module.exports = swaggerConfig;
