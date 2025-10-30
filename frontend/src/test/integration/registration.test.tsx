// src/test/integration/registration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegistrationForm from '../../components/animals/RegistrationForm';
import { mockAPI } from '../../services/mockApi';

vi.mock('../../services/mockApi', () => ({
  mockAPI: {
    createAnimal: vi.fn(),
  },
}));

describe('Registration Form Integration', () => {
  it('should register a new animal and trigger refresh', async () => {
    const user = userEvent.setup();
    const mockOnAnimalAdded = vi.fn();
    
    vi.mocked(mockAPI.createAnimal).mockResolvedValue({
      success: true,
      data: { 
        id: 999, 
        name: 'New Pig', 
        type: 'Pig', 
        health: 'Healthy', 
        county: 'Nakuru', 
        owner: 'Test', 
        lat: -0.303099, 
        lng: 36.080025 
      },
      message: 'Animal registered successfully'
    });

    render(<RegistrationForm onAnimalAdded={mockOnAnimalAdded} />);

    // Fill out the form
    await user.type(screen.getByPlaceholderText('Enter animal name'), 'New Pig');
    await user.type(screen.getByPlaceholderText('Enter owner name'), 'Test Owner');
    await user.selectOptions(screen.getByDisplayValue('Cattle'), 'Pig');

    // Submit form
    await user.click(screen.getByText('Register Animal'));

    // Verify API call and callback
    await waitFor(() => {
      expect(mockAPI.createAnimal).toHaveBeenCalledWith({
        name: 'New Pig',
        type: 'Pig',
        health: 'Healthy',
        county: 'Nakuru',
        owner: 'Test Owner',
        lat: -0.303099,
        lng: 36.080025,
      });
      expect(mockOnAnimalAdded).toHaveBeenCalled();
    });

    // Verify success message
    expect(screen.getByText('Animal registered successfully!')).toBeInTheDocument();
  });
});