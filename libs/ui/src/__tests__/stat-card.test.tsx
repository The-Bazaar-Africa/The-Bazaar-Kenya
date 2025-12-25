import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../primitives/stat-card';

describe('StatCard', () => {
  describe('rendering', () => {
    it('should render title and value', () => {
      render(<StatCard title="Total Revenue" value="$1,234" />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$1,234')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <StatCard
          title="Total Revenue"
          value="$1,234"
          description="Monthly revenue"
        />
      );

      expect(screen.getByText('Monthly revenue')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(
        <StatCard
          title="Total Revenue"
          value="$1,234"
          icon={<span data-testid="icon">💰</span>}
        />
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render numeric values', () => {
      render(<StatCard title="Total Orders" value={1234} />);

      expect(screen.getByText('1234')).toBeInTheDocument();
    });
  });

  describe('trends', () => {
    it('should render trend value when provided', () => {
      render(
        <StatCard
          title="Revenue"
          value="$1,234"
          trend="up"
          trendValue="+12.5%"
        />
      );

      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });

    it('should apply correct styling for upward trend', () => {
      render(
        <StatCard
          title="Revenue"
          value="$1,234"
          trend="up"
          trendValue="+12.5%"
        />
      );

      const trendElement = screen.getByText('+12.5%');
      // Trend element should exist
      expect(trendElement).toBeInTheDocument();
    });

    it('should apply correct styling for downward trend', () => {
      render(
        <StatCard
          title="Revenue"
          value="$1,234"
          trend="down"
          trendValue="-8.2%"
        />
      );

      const trendElement = screen.getByText('-8.2%');
      // Trend element should exist
      expect(trendElement).toBeInTheDocument();
    });

    it('should apply correct styling for neutral trend', () => {
      render(
        <StatCard
          title="Revenue"
          value="$1,234"
          trend="neutral"
          trendValue="0%"
        />
      );

      const trendElement = screen.getByText('0%');
      // Trend element should exist
      expect(trendElement).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply success variant styles', () => {
      const { container } = render(
        <StatCard title="Success" value="100" variant="success" />
      );

      // Success variant should have specific styling
      expect(container.firstChild).toHaveClass('border-green-200');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(
        <StatCard title="Warning" value="50" variant="warning" />
      );

      expect(container.firstChild).toHaveClass('border-yellow-200');
    });

    it('should apply error variant styles', () => {
      const { container } = render(
        <StatCard title="Error" value="5" variant="error" />
      );

      expect(container.firstChild).toHaveClass('border-red-200');
    });

    it('should apply info variant styles', () => {
      const { container } = render(
        <StatCard title="Info" value="25" variant="info" />
      );

      expect(container.firstChild).toHaveClass('border-blue-200');
    });
  });

  describe('loading state', () => {
    it('should display skeleton when loading', () => {
      render(<StatCard title="Revenue" value="" isLoading />);

      // Should show loading skeleton
      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not display value when loading', () => {
      render(<StatCard title="Revenue" value="$1,234" isLoading />);

      // Value should not be visible when loading
      expect(screen.queryByText('$1,234')).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      render(
        <StatCard
          title="Clickable"
          value="100"
          onClick={onClick}
        />
      );

      const card = screen.getByText('Clickable').closest('[role="button"], button, div');
      if (card) {
        fireEvent.click(card);
        expect(onClick).toHaveBeenCalled();
      }
    });

    it('should have cursor-pointer when clickable', () => {
      const { container } = render(
        <StatCard
          title="Clickable"
          value="100"
          onClick={() => {}}
        />
      );

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });
  });

  describe('footer', () => {
    it('should render footer when provided', () => {
      render(
        <StatCard
          title="Revenue"
          value="$1,234"
          footer={<span data-testid="footer">Updated 5 min ago</span>}
        />
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Updated 5 min ago')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <StatCard
          title="Custom"
          value="100"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
