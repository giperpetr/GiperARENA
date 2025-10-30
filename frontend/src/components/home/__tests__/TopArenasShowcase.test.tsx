import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopArenasShowcase } from '../TopArenasShowcase';
import { api } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    getArenas: jest.fn(),
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

const mockArenas = [
  {
    id: '1',
    name: 'Test Arena 1',
    game_type: 'Robot Battle',
    rating: '4.5',
    price_per_minute: '10.00',
    location_address: 'Test City',
    status: 'active',
    arena_type: 'indoor',
  },
  {
    id: '2',
    name: 'Test Arena 2',
    game_type: 'Drone Race',
    rating: '4.8',
    price_per_minute: '15.00',
    location_address: 'Another City',
    status: 'active',
    arena_type: 'outdoor',
  },
];

describe('TopArenasShowcase', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  // Test 1: Component renders with API data
  it('should render arenas from API', async () => {
    (api.getArenas as jest.Mock).mockResolvedValue(mockArenas);

    render(
      <QueryClientProvider client={queryClient}>
        <TopArenasShowcase />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Arena 1')).toBeInTheDocument();
      expect(screen.getByText('Test Arena 2')).toBeInTheDocument();
    });
  });

  // Test 2: Loading state shows skeleton
  it('should show loading state', () => {
    (api.getArenas as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TopArenasShowcase />
      </QueryClientProvider>
    );

    // Check for loading skeleton indicators
    expect(screen.getByText('Top Arenas')).toBeInTheDocument();
  });

  // Test 3: Error state displays message
  it('should show error message on API failure', async () => {
    (api.getArenas as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <QueryClientProvider client={queryClient}>
        <TopArenasShowcase />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  // Test 4: Rating is parsed correctly
  it('should parse rating from string to number', async () => {
    (api.getArenas as jest.Mock).mockResolvedValue([mockArenas[0]]);

    render(
      <QueryClientProvider client={queryClient}>
        <TopArenasShowcase />
      </QueryClientProvider>
    );

    await waitFor(() => {
      // Rating display should show 4.5
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });

  // Test 5: API called with correct parameters
  it('should call API with limit parameter', async () => {
    (api.getArenas as jest.Mock).mockResolvedValue(mockArenas);

    render(
      <QueryClientProvider client={queryClient}>
        <TopArenasShowcase />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(api.getArenas).toHaveBeenCalledWith({
        limit: 6,
        sort: 'rating',
      });
    });
  });
});
