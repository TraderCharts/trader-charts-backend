// eslint.config.js
const babelParser = require("@babel/eslint-parser");
const prettierPlugin = require("eslint-plugin-prettier");
const importPlugin = require("eslint-plugin-import");
const unusedImportsPlugin = require("eslint-plugin-unused-imports");

module.exports = [
    {
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: true,
                ecmaVersion: 2024,
                sourceType: "module",
            },
            globals: {
                // Node globals
                __dirname: "readonly",
                __filename: "readonly",
                process: "readonly",
                module: "readonly",
                require: "readonly",
                console: "readonly",

                // Mocha globals
                describe: "readonly",
                it: "readonly",
                before: "readonly",
                after: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
            },
        },
        plugins: {
            prettier: prettierPlugin,
            import: importPlugin,
            "unused-imports": unusedImportsPlugin,
        },
        rules: {
            // ESLint recommended equivalents
            "no-cond-assign": "error",
            "no-constant-condition": "warn",
            "no-control-regex": "warn",
            "no-dupe-args": "error",
            "no-dupe-keys": "error",
            "no-duplicate-case": "error",
            "no-empty": ["warn", { allowEmptyCatch: true }],
            "no-ex-assign": "error",
            "no-extra-boolean-cast": "warn",
            "no-func-assign": "error",
            "no-invalid-regexp": "error",
            "no-irregular-whitespace": "error",
            "no-loss-of-precision": "warn",
            "no-misleading-character-class": "error",
            "no-obj-calls": "error",
            "no-prototype-builtins": "warn",
            "no-sparse-arrays": "warn",
            "no-unexpected-multiline": "error",
            "no-unreachable": "error",
            "no-unsafe-finally": "error",
            "no-unsafe-negation": "error",
            "use-isnan": "error",
            "valid-typeof": "error",

            // Custom rules
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-undef": "error",
            semi: ["error", "always"],
            "arrow-parens": ["error", "always"],
            "prefer-const": ["error", { destructuring: "all" }],
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "prettier/prettier": "error",
            "no-console": "off",
        },
    },
];
