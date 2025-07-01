import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50" aria-label="Loading">
      <div className="loader-spinner">
        <div className="blade top"></div>
        <div className="blade bottom"></div>
      </div>
    </div>
  );
};

export default Loader;