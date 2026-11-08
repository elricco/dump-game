/** Schichten: render -> adapters -> core, nie umgekehrt. */
module.exports = {
  forbidden: [
    {
      name: 'core-ist-rein',
      severity: 'error',
      comment: 'src/core darf weder adapters noch render importieren.',
      from: { path: '^src/core' },
      to: { path: '^src/(adapters|render)' },
    },
    {
      name: 'adapters-nicht-nach-render',
      severity: 'error',
      from: { path: '^src/adapters' },
      to: { path: '^src/render' },
    },
    {
      name: 'keine-zyklen',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
}
