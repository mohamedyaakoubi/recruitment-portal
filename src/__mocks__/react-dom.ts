// This mock is for testing environments that need to stub out react-dom
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactDomActual = require('react-dom');

module.exports = {
  ...reactDomActual,
  createRoot: () => ({
    render: (_app: unknown) => {
      // No-op
    },
    unmount: () => {
      // No-op
    },
  }),
};