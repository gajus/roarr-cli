module.exports = {
  overrides: [
    {
      extends: [
        'canonical',
        'canonical/node',
        'canonical/typescript',
      ],
      files: '*.ts',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      extends: ['canonical'],
      files: '*.js',
    },
  ],
  root: true,
};
