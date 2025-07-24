# Skald Client - Modern React Web Application

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)
[![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)

A comprehensive React/TypeScript frontend application for content management and social media automation. Built with modern web technologies and enterprise-grade features, originally developed for ContentAutoPilot.

## 🚀 Features

### Core Technology Stack
- **React 18** - Latest React with Concurrent Features
- **TypeScript** - Full type safety with strict mode
- **Vite** - Lightning-fast development and building
- **Material-UI (MUI)** - Google's Material Design system
- **Redux Toolkit** - Predictable state management
- **React Router** - Declarative routing
- **Framer Motion** - Production-ready motion library

### Key Features
- 📊 **Advanced Analytics Dashboard** - Interactive charts and real-time data
- 📝 **Content Creation System** - Rich text editor with media support
- 🔗 **Social Media Integrations** - LinkedIn, Instagram, TikTok, Facebook, Twitter
- 📅 **Content Scheduling** - Calendar-based scheduling with optimal timing
- 🎯 **Performance Monitoring** - Real-time performance tracking
- 👥 **Multi-tenant Architecture** - Organizations and workspaces
- 🎨 **Modern UI/UX** - Responsive design with accessibility features
- 🚀 **Progressive Web App** - Offline support and native app experience

### Advanced Components
- **Onboarding System** - Guided user experience with product tours
- **Analytics Dashboard** - Performance metrics and insights
- **Content Calendar** - Visual scheduling interface
- **Team Management** - User roles and permissions
- **Competitive Intelligence** - Market analysis and competitor tracking
- **Report Generation** - Automated reporting with export capabilities

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Development](#development)
- [Architecture](#architecture)
- [Components](#components)
- [Testing](#testing)
- [Performance](#performance)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser

### Installation

```bash
# Clone the repository
git clone git@github.com:mhowardson/Skald_Client.git
cd Skald_Client

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_HOST=localhost
VITE_API_PORT=3000
VITE_API_PROTOCOL=http

# Application Configuration
VITE_APP_NAME=Skald Client
VITE_APP_VERSION=1.0.0

# Web Server Configuration
VITE_WEB_HOST=localhost
VITE_WEB_PORT=5173

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_VISUAL_TESTING=true

# External Services
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_ANALYTICS_ID=your-analytics-id-here
```

## 🛠️ Development

### Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── analytics/       # Analytics and reporting components
│   ├── auth/           # Authentication components
│   ├── content/        # Content management components
│   ├── layout/         # Layout and navigation
│   ├── scheduling/     # Scheduling and calendar components
│   └── workspace/      # Workspace management
├── features/           # Feature-specific modules
│   └── onboarding/     # User onboarding system
├── hooks/              # Custom React hooks
├── pages/              # Page components (routes)
├── store/              # Redux store and API slices
├── test/               # Test files and utilities
├── theme/              # Material-UI theme configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Technologies

#### Frontend Framework
- **React 18** - Component-based UI library
- **TypeScript 5.0** - Static type checking
- **Vite 4.4** - Build tool and dev server

#### UI Framework
- **Material-UI 5.14** - React component library
- **Emotion** - CSS-in-JS styling
- **Framer Motion** - Animation library

#### State Management
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Hook Form** - Form state management

#### Routing & Navigation
- **React Router 6** - Client-side routing
- **React Router DOM** - DOM bindings

## 🧩 Components

### Analytics Components

#### Performance Dashboard
```typescript
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';

<PerformanceDashboard
  timeRange="last30days"
  platforms={['linkedin', 'instagram', 'twitter']}
  onTimeRangeChange={handleTimeRangeChange}
/>
```

#### Engagement Analysis
```typescript
import { EngagementAnalysis } from '@/components/analytics/EngagementAnalysis';

<EngagementAnalysis
  contentId="content-123"
  showComparisons={true}
  enableRealTime={true}
/>
```

### Content Components

#### Rich Text Editor
```typescript
import { ModernRichTextEditor } from '@/components/content/ModernRichTextEditor';

<ModernRichTextEditor
  value={content}
  onChange={handleContentChange}
  platforms={['linkedin', 'instagram']}
  showCharacterCount={true}
  enableAIAssistance={true}
/>
```

#### Content Calendar
```typescript
import { ContentCalendar } from '@/components/content/ContentCalendar';

<ContentCalendar
  view="month"
  selectedDate={selectedDate}
  onDateSelect={handleDateSelect}
  onEventCreate={handleEventCreate}
  enableDragAndDrop={true}
/>
```

### Onboarding Components

#### Product Tour
```typescript
import { ProductTourContainer } from '@/features/onboarding/components/ProductTour';

<ProductTourContainer
  tourId="dashboard-tour"
  autoStart={false}
  onComplete={handleTourComplete}
  theme="light"
/>
```

#### Welcome Modal
```typescript
import { WelcomeModal } from '@/features/onboarding/components/WelcomeModal';

<WelcomeModal
  open={showWelcome}
  onClose={handleWelcomeClose}
  userName={user.firstName}
  organizationName={organization.name}
/>
```

## 🧪 Testing

### Testing Strategy

The application includes comprehensive testing infrastructure:

- **Unit Tests** - Component and utility testing with Vitest
- **Integration Tests** - API integration testing
- **E2E Tests** - Full user workflow testing with Playwright
- **Visual Testing** - Visual regression testing
- **Performance Testing** - Lighthouse and performance budgets

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run integration tests
npm run test:integration

# Run unit tests only
npm run test:unit

# Generate coverage report
npm run test:coverage
```

### Visual Testing

```bash
# Run visual tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update

# Run visual tests with UI
npm run test:visual:ui

# Run visual tests in headed mode
npm run test:visual:headed
```

### Performance Testing

```bash
# Run performance tests
npm run test:performance

# Run Lighthouse CI
npm run test:performance:lighthouse

# Check performance budgets
npm run test:performance:budget

# Run load testing
npm run test:performance:load
```

### Test Examples

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ContentCreationPage } from '@/pages/content/ContentCreationPage';

describe('ContentCreationPage', () => {
  test('should render content creation form', () => {
    render(<ContentCreationPage />);
    expect(screen.getByRole('textbox', { name: /content/i })).toBeInTheDocument();
  });

  test('should handle form submission', async () => {
    const onSubmit = vi.fn();
    render(<ContentCreationPage onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /publish/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
```

#### API Integration Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useContentCreation } from '@/hooks/useContentCreation';

describe('useContentCreation', () => {
  test('should create content successfully', async () => {
    const { result } = renderHook(() => useContentCreation());
    
    act(() => {
      result.current.createContent({
        text: 'Test content',
        platform: 'linkedin'
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

## ⚡ Performance

### Performance Optimization

The application implements several performance optimization strategies:

#### Code Splitting
```typescript
// Lazy loading for route components
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));

// Component-level code splitting
const ModernContentEditor = lazy(() => 
  import('@/components/content/ModernContentEditor')
);
```

#### Bundle Optimization
- **Tree Shaking** - Eliminates unused code
- **Dynamic Imports** - Loads components on demand
- **Asset Optimization** - Image compression and lazy loading
- **Service Worker** - Caching and offline support

#### Performance Monitoring

```typescript
// Performance tracking
import { performanceMonitor } from '@/utils/performance';

performanceMonitor.trackPageLoad('dashboard');
performanceMonitor.trackUserInteraction('content-creation');
performanceMonitor.trackAPICall('create-content', duration);
```

### Performance Budgets

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

## 🎨 UI/UX Features

### Design System

#### Material-UI Theme
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});
```

#### Responsive Design
```typescript
// Breakpoints configuration
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Responsive component example
const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
  [theme.breakpoints.up('lg')]: {
    gap: theme.spacing(3),
  },
}));
```

### Accessibility Features

- **ARIA Labels** - Comprehensive screen reader support
- **Keyboard Navigation** - Full keyboard accessibility
- **Color Contrast** - WCAG AA compliant color schemes
- **Focus Management** - Logical focus order and visible indicators
- **Semantic HTML** - Proper HTML structure and landmarks

### Animation & Interactions

```typescript
import { motion } from 'framer-motion';

// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration

#### Production Environment Variables
```bash
# Production API
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_PROTOCOL=https

# Application
VITE_APP_NAME=Skald Client
VITE_APP_VERSION=1.0.0

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run test:visual
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: echo "Deploy to production"
```

## 🏗️ Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────┐
│                     App                         │
│  ┌─────────────────────────────────────────────┤
│  │              Router                         │
│  │  ┌─────────────────────────────────────────┤
│  │  │            Layout                       │
│  │  │  ┌─────────────────────────────────────┤
│  │  │  │          Pages                      │
│  │  │  │  ┌─────────────────────────────────┤
│  │  │  │  │       Components                │
│  │  │  │  │  ┌─────────────────────────────┤
│  │  │  │  │  │      Features               │
│  │  │  │  │  └─────────────────────────────┤
│  │  │  │  └─────────────────────────────────┤
│  │  │  └─────────────────────────────────────┤
│  │  └─────────────────────────────────────────┤
│  └─────────────────────────────────────────────┤
└─────────────────────────────────────────────────┘
```

### State Management

```typescript
// Store structure
interface RootState {
  auth: AuthState;
  tenant: TenantState;
  ui: UIState;
  api: ApiState;
}

// RTK Query API slices
const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Organization', 'Content', 'Analytics'],
  endpoints: (builder) => ({
    // API endpoints defined in separate files
  }),
});
```

### Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │────│   Action    │────│   Reducer   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                      │
       │           ┌─────────────┐           │
       └───────────│    Store    │───────────┘
                   └─────────────┘
                          │
                   ┌─────────────┐
                   │  API Layer  │
                   └─────────────┘
                          │
                   ┌─────────────┐
                   │   Backend   │
                   └─────────────┘
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone git@github.com:yourusername/Skald_Client.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install`
5. **Start** development server: `npm run dev`
6. **Make** your changes
7. **Run** tests: `npm test`
8. **Run** linting: `npm run lint`
9. **Commit** changes: `git commit -m 'Add amazing feature'`
10. **Push** to branch: `git push origin feature/amazing-feature`
11. **Create** a Pull Request

### Code Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### ESLint Configuration
```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
```

### Component Development Guidelines

#### Component Structure
```typescript
// Component template
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({
  // Props destructuring
}) => {
  // Hooks
  // Event handlers
  // Render logic

  return (
    // JSX
  );
};

// Default export
export default Component;
```

#### Testing Requirements
- **Unit tests** for all components
- **Integration tests** for complex interactions
- **Visual tests** for UI components
- **Accessibility tests** for interactive elements

## 📊 Project Statistics

### Codebase Overview
- **209 files** with **80,000+ lines of code**
- **React Components** - 100+ reusable components
- **TypeScript Coverage** - 100% TypeScript implementation
- **Test Coverage** - Comprehensive test suite
- **Performance Score** - 90+ Lighthouse score target

### Technology Breakdown
- **Frontend Framework** - React 18 with TypeScript
- **Build Tool** - Vite 4.4 with HMR
- **UI Library** - Material-UI 5.14
- **State Management** - Redux Toolkit with RTK Query
- **Testing** - Vitest + Playwright + Visual Testing
- **Performance** - Lighthouse CI + Performance Budgets

## 📚 Documentation

### Component Documentation
```bash
# Generate component documentation
npm run docs:components

# Generate hooks documentation
npm run docs:hooks

# Generate all documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve
```

### API Documentation
- **Component Props** - Full TypeScript interface documentation
- **Hook Usage** - Custom hooks with examples
- **Store Structure** - Redux state documentation
- **Performance Guides** - Optimization best practices

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Prettier - Code formatter**
- **ESLint**

### Browser DevTools
- **React Developer Tools** - Component inspection
- **Redux DevTools** - State debugging
- **Lighthouse** - Performance auditing
- **Web Vitals** - Core web vitals monitoring

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### TypeScript Errors
```bash
# Run type checking
npm run typecheck

# Check for unused imports
npm run lint -- --fix
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build -- --analyze

# Run performance tests
npm run test:performance
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Material-UI Team** - For the comprehensive design system
- **Vite Team** - For the lightning-fast build tool
- **Redux Team** - For predictable state management
- **Playwright Team** - For reliable E2E testing

---

**Built with ❤️ using modern web technologies and best practices.**

*Originally developed for ContentAutoPilot - A comprehensive content management and social media automation platform.*

## 🔗 Related Projects

- **[Skald Node](https://github.com/mhowardson/Skald_Node)** - Backend API server
- **[Skald Mobile](https://github.com/mhowardson/Skald_Mobile)** - React Native mobile app (coming soon)

## 📞 Support

For issues and questions:

1. **GitHub Issues** - Bug reports and feature requests
2. **Documentation** - Check the `/docs` folder for detailed guides
3. **Community** - Join our developer community

## 🎯 Roadmap

### Upcoming Features
- **Real-time Collaboration** - Multi-user content editing
- **Advanced AI Integration** - Content generation and optimization
- **Mobile App** - React Native companion app
- **Plugin System** - Extensible architecture
- **Advanced Analytics** - Machine learning insights

### Performance Targets
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **First Input Delay** - < 100ms
- **Lighthouse Score** - > 95/100