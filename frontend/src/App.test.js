import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders sign in heading', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  const heading = screen.getByText(/sign in to your dashboard/i);
  expect(heading).toBeInTheDocument();
});
