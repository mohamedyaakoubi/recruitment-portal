const reactDom = jest.requireActual('react-dom');

module.exports = {
  ...reactDom,
  createPortal: (node: any) => node,
};
