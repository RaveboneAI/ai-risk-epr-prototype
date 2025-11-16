/**
 * Application Context
 * Global state management
 */

import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  selectedPatientId: null,
  mode: 'guideline',
  expandedSections: {
    risk: true,
    diagnosis: true,
    labs: true,
    vitals: true
  },
  searchTerm: '',
  filterHighRisk: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SELECT_PATIENT':
      return { 
        ...state, 
        selectedPatientId: action.payload 
      };
    
    case 'SET_MODE':
      return { 
        ...state, 
        mode: action.payload 
      };
    
    case 'TOGGLE_SECTION':
      return {
        ...state,
        expandedSections: {
          ...state.expandedSections,
          [action.payload]: !state.expandedSections[action.payload]
        }
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload
      };
    
    case 'TOGGLE_FILTER_HIGH_RISK':
      return {
        ...state,
        filterHighRisk: !state.filterHighRisk
      };
    
    case 'EXPAND_ALL':
      return {
        ...state,
        expandedSections: {
          risk: true,
          diagnosis: true,
          labs: true,
          vitals: true
        }
      };
    
    case 'COLLAPSE_ALL':
      return {
        ...state,
        expandedSections: {
          risk: false,
          diagnosis: false,
          labs: false,
          vitals: false
        }
      };
    
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

