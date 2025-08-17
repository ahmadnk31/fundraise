# Fullscreen Search Component

A comprehensive, fullscreen search experience with real-time results, keyboard navigation, and recent search history.

## Features

- **Real-time Search**: Debounced search with live results as you type
- **Keyboard Navigation**: Use arrow keys to navigate, Enter to select, Escape to close
- **Keyboard Shortcuts**: 
  - `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open from anywhere
- **Recent Searches**: Automatically saves and displays recent search queries
- **Multiple Result Types**: Supports campaigns, categories, and users (when implemented)
- **Mobile Responsive**: Fully responsive design with mobile-specific interactions
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage

### Basic Implementation

```tsx
import { FullscreenSearch } from '@/components/FullscreenSearch';

function MyComponent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleCampaignSelect = (campaignId: string) => {
    // Navigate to campaign page
    navigate(`/campaign/${campaignId}`);
  };

  return (
    <>
      <Button onClick={() => setIsSearchOpen(true)}>
        Search
      </Button>
      
      <FullscreenSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onCampaignSelect={handleCampaignSelect}
      />
    </>
  );
}
```

### With Keyboard Shortcut

```tsx
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

function MyComponent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Add global keyboard shortcut
  useKeyboardShortcut(
    { key: 'k', meta: true }, // Cmd+K on Mac
    () => setIsSearchOpen(true)
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls whether the search modal is visible |
| `onClose` | `() => void` | Callback when the search modal should be closed |
| `onCampaignSelect` | `(campaignId: string) => void` | Callback when a campaign is selected |

## Keyboard Shortcuts

- **Open Search**: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- **Close Search**: `Escape`
- **Navigate Results**: `↑` / `↓` Arrow keys
- **Select Result**: `Enter`
- **Clear Search**: Click X button or clear input

## Search Categories

The component searches through:

1. **Campaigns**: Real-time search through campaign titles, descriptions, and categories
2. **Categories**: Matches category names for quick browsing
3. **Users**: (Future feature) Search for campaign creators

## Data Storage

- Recent searches are stored in `localStorage`
- Maximum of 5 recent searches are kept
- Search history persists across browser sessions

## Customization

### Styling

The component uses Tailwind CSS and shadcn/ui components. Customize by:

1. Modifying the CSS classes in the component
2. Updating the color scheme through CSS variables
3. Adjusting animations and transitions

### Search Logic

Extend the search functionality by:

1. Adding new result types to the `SearchResult` interface
2. Implementing additional search endpoints in the API service
3. Customizing the search debounce timing (currently 300ms)

## Performance

- **Debounced Requests**: Search requests are debounced by 300ms to reduce API calls
- **Efficient Rendering**: Only renders visible results with proper key props
- **Memory Management**: Cleans up event listeners and timers on unmount
- **Cached Results**: Recent searches are cached for instant display

## Accessibility

- Full keyboard navigation support
- Screen reader announcements for search states
- Focus management and trapping
- Semantic HTML structure
- ARIA labels and descriptions

## Browser Support

- Modern browsers with ES6+ support
- Mobile Safari and Chrome
- Desktop Chrome, Firefox, Safari, Edge

## Dependencies

- React 18+
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- React Router (for navigation)
