import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '../Loader';
import '@testing-library/jest-dom';

describe('Loader', () => {
  it('should render correctly', () => {
    render(<Loader />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });
});
