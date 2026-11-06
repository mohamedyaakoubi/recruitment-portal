import React from 'react';

const Loader = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90"
      aria-label="Loading"
    >
      <div className="loader-spinner">
        <div className="blade top"></div>
        <div className="blade bottom"></div>
      </div>
    </div>
  );
};

export default Loader;
