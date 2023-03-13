module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "eslint-plugin-prettier"],
  rules: {
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
    "no-unused-vars": "off",
    "sort-imports": "off",
  },
};
