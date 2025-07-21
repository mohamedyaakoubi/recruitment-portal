module.exports = {
  ...jest.requireActual('react-dom'),
  createRoot: () => ({
    render: (app) => {
      // No-op
    },
    unmount: () => {
      // No-op
    },
  }),
};