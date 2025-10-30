import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tantml:react-query';
import { TrendingTournaments } from '../TrendingTournaments';
import { api } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    getTournaments: jest.fn(),
  },
}));

const mockApiClient = api as jest.Mocked<typeof api>;

describe('TrendingTournaments', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  // TEST 1: Render component and fetch tournaments
  it('should fetch tournaments from API and display them', async () => {
    const mockTournaments = [
      {
        id: '1',
        name: 'Robot Racing Championship',
        prize_pool: 50000,
        current_participants: 256,
        status: 'upcoming',
        tournament_type: 'single_elimination',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { rank: 1, image: '🏎️' },
      },
      {
        id: '2',
        name: 'Claw Games Masters',
        prize_pool: 25000,
        current_participants: 512,
        status: 'upcoming',
        tournament_type: 'round_robin',
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { rank: 2, image: '🎯' },
      },
      {
        id: '3',
        name: 'Drone Racing League',
        prize_pool: 75000,
        current_participants: 128,
        status: 'upcoming',
        tournament_type: 'double_elimination',
        start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { rank: 3, image: '🚁' },
      },
    ];

    mockApiClient.getTournaments.mockResolvedValue(mockTournaments);

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingTournaments />
      </QueryClientProvider>
    );

    // Wait for tournaments to load
    await waitFor(() => {
      expect(screen.getByText('Robot Racing Championship')).toBeInTheDocument();
    });

    expect(screen.getByText('Claw Games Masters')).toBeInTheDocument();
    expect(screen.getByText('Drone Racing League')).toBeInTheDocument();
    expect(mockApiClient.getTournaments).toHaveBeenCalledWith({
      status: 'upcoming',
      limit: 3,
    });
  });

  // TEST 2: Show loading state with skeleton cards
  it('should show loading skeleton while fetching', () => {
    mockApiClient.getTournaments.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingTournaments />
      </QueryClientProvider>
    );

    // Should show 3 loading skeleton cards
    const skeletons = screen.getAllByTestId('tournament-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  // TEST 3: Show error state when API fails
  it('should show error message when API call fails', async () => {
    mockApiClient.getTournaments.mockRejectedValue(new Error('API Error'));

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingTournaments />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load tournaments/i)
      ).toBeInTheDocument();
    });
  });

  // TEST 4: Show empty state when no tournaments available
  it('should show empty state when no tournaments returned', async () => {
    mockApiClient.getTournaments.mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingTournaments />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No upcoming tournaments/i)
      ).toBeInTheDocument();
    });
  });

  // TEST 5: Display prize pool correctly
  it('should format and display prize pool', async () => {
    const mockTournaments = [
      {
        id: '1',
        name: 'Test Tournament',
        prize_pool: 50000,
        current_participants: 100,
        status: 'upcoming',
        tournament_type: 'single_elimination',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { rank: 1, image: '🏆' },
      },
    ];

    mockApiClient.getTournaments.mockResolvedValue(mockTournaments);

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingTournaments />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });
  });
});
