module.exports = {
  ...jest.requireActual('react-dom'),
  createRoot: () => ({
    render: (_app) => {
      // No-op
    },
    unmount: () => {
      // No-op
    },
  }),
};