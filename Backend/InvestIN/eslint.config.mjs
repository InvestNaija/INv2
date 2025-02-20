import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
   {ignores: ["dist/"]},
   {files: ["**/*.{js,mjs,cjs,ts}"]},
   {languageOptions: { globals: globals.node }},
   pluginJs.configs.recommended,
   ...tseslint.configs.recommended,
   {
      rules: {
         camelcase: "error",
         "no-const-assign": "off",
         "no-underscore-dangle": ["error", { "allow": ["__"] }],
         "class-methods-use-this": "off", // Optional, turn off if you don"t require class methods to use "this"
         "no-multi-assign": "off", // Optional, turn off if you allow multiple assignments in a single line
         "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
         indent: [
            "warn", 3
         ],
         semi: [
            "error", "always"
         ],
         "consistent-return": "error"
      },}
];