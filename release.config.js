export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    ['@semantic-release/changelog', { changelogFile: 'packages/fastify-log-filters/CHANGELOG.md' }],
    ['@anolilab/semantic-release-pnpm', { pkgRoot: 'packages/fastify-log-filters' }],
    ['@semantic-release/github', { successComment: false, failComment: false, releasedLabels: false }],
  ],
};
