# Using the Refactored Application

## Quick Start

The application has been refactored into a modern React architecture with:
- Custom hooks
- Context API for state management
- Component-based architecture
- Error boundaries and loading states
- **Patient search functionality**

## To Use the Refactored Version

### Option 1: Replace App.js (Recommended for production)

```bash
# Backup original
mv src/App.js src/App.original.js

# Use refactored version
mv src/AppRefactored.js src/App.js
```

### Option 2: Update index.js to use refactored version

Edit `src/index.js`:

```javascript
import AppRefactored from './AppRefactored';

// ... existing code ...

root.render(
  <React.StrictMode>
    <AppRefactored />
  </React.StrictMode>
);
```

## What's New

### 1. Patient Search ✨
- Search by patient name or presenting complaint
- Real-time filtering as you type
- Clear button to reset search

### 2. Better State Management
- Context API manages global state
- No prop drilling
- Cleaner component hierarchy

### 3. Custom Hooks
- `usePatients()` - Fetches patient list with loading/error states
- `usePatientData(id, mode)` - Fetches detailed patient data

### 4. Error Handling
- Error boundaries catch crashes
- Retry functionality on errors
- Better error messages

### 5. Loading States
- Professional loading spinners
- Loading messages
- Better UX

### 6. Modular Components
```
components/
├── common/
│   ├── ErrorBoundary.js
│   ├── LoadingSpinner.js
│   ├── ErrorMessage.js
│   └── CollapsibleSection.js
├── layout/
│   ├── Header.js
│   └── Toolbar.js
├── patient/
│   ├── PatientList.js
│   ├── PatientBanner.js
│   └── PatientSearch.js    ← NEW!
└── clinical/
    └── index.js (RiskCard, DiagnosisPanel, etc.)
```

## Features

### Patient Search
- Type in the search box to filter patients
- Search works on:
  - Patient names
  - Presenting complaints
- Case-insensitive
- Real-time results

### All Original Features Preserved
- ✅ NEWS2 scoring table
- ✅ Diagnosis scoring (NICE/NHSE)
- ✅ Collapsible sections
- ✅ Abnormal value indicators
- ✅ Color-coded risk levels
- ✅ Patient demographics banner
- ✅ Mode toggle (Demo/Guideline)

## Backend API Changes

The refactored frontend works with the improved backend that includes:
- ✅ Error handling
- ✅ Input validation
- ✅ Request logging
- ✅ Caching (5min for patients)
- ✅ Rate limiting
- ✅ Security headers

## Development

```bash
# Install dependencies (if not done)
cd frontend
npm install

# Start development server
npm start
```

## Testing the Search

1. Start the frontend
2. You should see 10 patients in the list
3. Type "Smith" in the search box
4. You'll see only George Smith
5. Type "chest pain" 
6. You'll see patients with chest pain complaints
7. Clear the search to see all patients again

## Performance

The refactored version includes:
- Memoization with `useMemo` for filtered patients
- Efficient re-renders
- Proper React patterns
- No unnecessary API calls

## Future Enhancements Ready

The new architecture makes it easy to add:
- [ ] Patient filtering by risk level
- [ ] Sorting options
- [ ] Favorite patients
- [ ] Recently viewed patients
- [ ] Multi-select actions
- [ ] Export selected patients

## Troubleshooting

### "Cannot find module" errors
Make sure all dependencies are installed:
```bash
npm install
```

### Search not working
1. Check browser console for errors
2. Verify backend is running on port 4000
3. Check network tab for API calls

### Original App.js still loading
Either update index.js or rename the files as described above.

## Support

If you encounter issues:
1. Check the browser console
2. Check the backend logs
3. Verify all files are in place
4. Try clearing browser cache

---

**Note:** Both versions (original and refactored) work with the same backend API. The refactored version just provides better code organization and new features like search.

