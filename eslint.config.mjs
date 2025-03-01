import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
	// import.meta.dirname is available after Node.js v20.11.0
	baseDirectory: import.meta.dirname,
});

const eslintConfig = [
	...compat.config({
		extends: ["next/core-web-vitals", "next/typescript", "prettier"],
		rules: {
			"react/no-unescaped-entities": "off",
			"@typescript-eslint/no-unused-vars": "off",
			semi: ["error"],
			quotes: ["error", "double"],
			"prefer-arrow-callback": ["error"],
			"prefer-const": ["error"],
			"prefer-template": ["error"],
		},
	}),
	{
		ignores: [".next/*", "node_modules/*", "tailwind.config.ts"],
	},
];

export default eslintConfig;
