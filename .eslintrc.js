module.exports = {
  overrides: [
    {
      extends: [
        'canonical',
        'canonical/node',
        'canonical/typescript',
        'canonical/prettier',
      ],
      files: '*.ts',
    },
    {
      extends: ['canonical', 'canonical/node', 'canonical/prettier'],
      files: '*.js',
    },
  ],
  root: true,
};
