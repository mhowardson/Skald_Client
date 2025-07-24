/**
 * Onboarding Provider Component
 * 
 * Wraps the application with onboarding context and global onboarding components.
 */

import React from 'react';
import { OnboardingProvider as OnboardingContextProvider } from '../contexts/OnboardingContext';
import { ProductTourContainer } from './ProductTour/ProductTourContainer';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  return (
    <OnboardingContextProvider>
      {children}
      <ProductTourContainer />
    </OnboardingContextProvider>
  );
};