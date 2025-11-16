/**
 * Component Tests for PatientSearch
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientSearch from '../patient/PatientSearch';

describe('PatientSearch Component', () => {
  test('renders search input', () => {
    const mockOnSearchChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('calls onSearchChange when typing', () => {
    const mockOnSearchChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    fireEvent.change(searchInput, { target: { value: 'Smith' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('Smith');
  });

  test('shows clear button when text is entered', () => {
    const mockOnSearchChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    
    // Initially no clear button
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument();
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Clear button should appear
    expect(screen.getByTitle('Clear search')).toBeInTheDocument();
  });

  test('clears search when clear button is clicked', () => {
    const mockOnSearchChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');
    
    // Click clear button
    const clearButton = screen.getByTitle('Clear search');
    fireEvent.click(clearButton);
    
    // Search should be cleared
    expect(searchInput.value).toBe('');
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });

  test('handles empty string input', () => {
    const mockOnSearchChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });

  test('maintains input value between renders', () => {
    const mockOnSearchChange = jest.fn();
    const { rerender } = render(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    fireEvent.change(searchInput, { target: { value: 'Jones' } });
    
    expect(searchInput.value).toBe('Jones');
    
    // Rerender component
    rerender(<PatientSearch onSearchChange={mockOnSearchChange} />);
    
    // Value should still be there (component maintains own state)
    const searchInputAfterRerender = screen.getByPlaceholderText(/search patients/i);
    expect(searchInputAfterRerender.value).toBe('Jones');
  });
});

