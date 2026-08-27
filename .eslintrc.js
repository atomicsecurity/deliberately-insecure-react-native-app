module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // Lab code is deliberately vulnerable/illustrative. It intentionally keeps
      // unused demo variables (e.g. the m2_vuln_npm_dep prototype-pollution probe)
      // and console logging (the m6_pii_logged lab). Do NOT let eslint "fix" the
      // vulnerable code — relax the noisy rules for the labs folder instead so the
      // planted vulns stay byte-identical to the plan while CI's `eslint .` passes.
      files: ['src/labs/**/*.ts', 'src/labs/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
      },
    },
  ],
};
