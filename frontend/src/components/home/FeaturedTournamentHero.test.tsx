import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeaturedTournamentHero } from './FeaturedTournamentHero';
import { api } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    getTournaments: jest.fn(),
  },
}));

const mockApiClient = api as jest.Mocked<typeof api>;

// Helper to create a QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to render with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('FeaturedTournamentHero', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TEST 1: should render loading state while fetching tournament data', () => {
    // Simulate pending API call
    mockApiClient.getTournaments.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithQueryClient(<FeaturedTournamentHero />);

    // Should show some loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('TEST 2: should fetch and display featured tournament data from API', async () => {
    const mockTournament = {
      id: '1',
      name: 'Robot Racing Championship',
      game_type: 'Robot Racing',
      entry_fee: '100',
      prize_pool: '50000',
      max_participants: 256,
      current_participants: 128,
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      status: 'upcoming' as const,
      description: 'Epic tournament',
      organizer_id: 'user-1',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockApiClient.getTournaments.mockResolvedValue({
      success: true,
      data: [mockTournament],
    } as any);

    renderWithQueryClient(<FeaturedTournamentHero />);

    await waitFor(() => {
      expect(screen.getByText(/Robot Racing Championship/i)).toBeInTheDocument();
    });

    // Should display tournament details
    expect(screen.getByText(/50,000/)).toBeInTheDocument(); // Prize pool
    expect(screen.getByText(/128/)).toBeInTheDocument(); // Participants
  });

  it('TEST 3: should display error/empty state when no tournaments available', async () => {
    mockApiClient.getTournaments.mockResolvedValue({
      success: true,
      data: [],
    } as any);

    renderWithQueryClient(<FeaturedTournamentHero />);

    await waitFor(() => {
      expect(
        screen.getByText(/no featured tournament/i)
      ).toBeInTheDocument();
    });
  });

  it('TEST 4: should handle API errors gracefully', async () => {
    mockApiClient.getTournaments.mockRejectedValue(
      new Error('API Error')
    );

    renderWithQueryClient(<FeaturedTournamentHero />);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load tournament/i)
      ).toBeInTheDocument();
    });
  });

  it('TEST 5: should call API with correct parameters', async () => {
    mockApiClient.getTournaments.mockResolvedValue({
      success: true,
      data: [],
    } as any);

    renderWithQueryClient(<FeaturedTournamentHero />);

    await waitFor(() => {
      expect(mockApiClient.getTournaments).toHaveBeenCalledWith({
        status: 'upcoming',
        limit: 1,
      });
    });
  });
});
