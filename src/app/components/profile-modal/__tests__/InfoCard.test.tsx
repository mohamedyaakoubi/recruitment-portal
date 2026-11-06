import React from 'react';
import { render, screen } from '@testing-library/react';
import { InfoCard, InfoRow } from '../InfoCard';
import '@testing-library/jest-dom';

describe('InfoCard', () => {
  it('should render the title and icon', () => {
    render(
      <InfoCard title="Test Title" icon={<span data-testid="icon" />}>
        Test Children
      </InfoCard>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render the children', () => {
    render(
      <InfoCard title="Test Title" icon={<span />}>
        Test Children
      </InfoCard>
    );
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});

describe('InfoRow', () => {
  it('should render the label and value', () => {
    render(<InfoRow label="Test Label" value="Test Value" />);
    expect(screen.getByText('Test Label:')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should render the icon if provided', () => {
    render(<InfoRow label="Test Label" value="Test Value" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render "N/A" if the value is null', () => {
    render(<InfoRow label="Test Label" value={null} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should not render if the value is undefined', () => {
    const { container } = render(<InfoRow label="Test Label" value={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
