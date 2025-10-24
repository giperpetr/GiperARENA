import { render, screen } from '@testing-library/react';
import { LiveGamesCarousel } from '../LiveGamesCarousel';
import { TrendingTournaments } from '../TrendingTournaments';
import { TopPlayersLeaderboard } from '../TopPlayersLeaderboard';
import { TopArenasShowcase } from '../TopArenasShowcase';
import { NewsSection } from '../NewsSection';

describe('Home Page Components', () => {
  describe('LiveGamesCarousel', () => {
    it('renders carousel with 12 live games', () => {
      render(<LiveGamesCarousel />);
      expect(screen.getByText('Caedrel')).toBeInTheDocument();
      expect(screen.getByText(/17,?734/)).toBeInTheDocument();
    });

    it('displays navigation buttons', () => {
      render(<LiveGamesCarousel />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('TrendingTournaments', () => {
    it('renders top 5 tournaments', () => {
      render(<TrendingTournaments />);
      expect(screen.getByText('Robot Racing Championship')).toBeInTheDocument();
      expect(screen.getByText(/\$50,?000/)).toBeInTheDocument();
    });

    it('displays action buttons for each tournament', () => {
      render(<TrendingTournaments />);
      expect(screen.getAllByText(/REGISTER|VIEW BRACKET|WATCH/).length).toBeGreaterThan(0);
    });
  });

  describe('TopPlayersLeaderboard', () => {
    it('renders top 10 players', () => {
      render(<TopPlayersLeaderboard />);
      expect(screen.getByText('Caedrel')).toBeInTheDocument();
      expect(screen.getByText('summit1g')).toBeInTheDocument();
    });

    it('displays player stats columns', () => {
      render(<TopPlayersLeaderboard />);
      expect(screen.getByText(/2847|2,847/)).toBeInTheDocument(); // rating
    });
  });

  describe('TopArenasShowcase', () => {
    it('renders top 6 arenas in grid', () => {
      render(<TopArenasShowcase />);
      expect(screen.getByText('Robot Track NYC')).toBeInTheDocument();
      expect(screen.getByText('Claw Master Tokyo')).toBeInTheDocument();
    });

    it('displays arena action buttons', () => {
      render(<TopArenasShowcase />);
      expect(screen.getAllByText(/PLAY|\+/).length).toBeGreaterThan(0);
    });
  });

  describe('NewsSection', () => {
    it('renders 5 news items', () => {
      render(<NewsSection />);
      expect(screen.getByText(/NEW ARENA OPENING/i)).toBeInTheDocument();
      expect(screen.getByText(/SEASON 3 CHAMPIONSHIP/i)).toBeInTheDocument();
    });
  });
});
