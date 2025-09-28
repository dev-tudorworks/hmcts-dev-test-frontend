# HMCTS Dev Test Frontend - Task Management UI

A modern, accessible task management frontend built with Node.js, TypeScript, Express, and GOV.UK Design System, designed for HMCTS caseworkers to efficiently manage their tasks through a intuitive web interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (currently running on 16.20.1 with warnings)
- npm or yarn
- Backend API running on http://localhost:8080

### Installation & Setup

```bash
# Install dependencies
npm install
# or
yarn install

# Build assets
npm run build
# or  
yarn webpack

# Start development server
npm run start:dev
# or
yarn start:dev
```

The application will start on `http://localhost:3000`

## 📋 Features

### Core Functionality
- ✅ **Task Dashboard**: Overview with statistics and task listing
- ✅ **CRUD Operations**: Create, view, edit, and delete tasks
- ✅ **Task Filtering**: Filter by status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ **Search Functionality**: Find tasks by title or description  
- ✅ **Status Management**: Quick status updates with one-click actions
- ✅ **Due Date Handling**: Visual indicators for overdue tasks
- ✅ **Responsive Design**: Mobile-friendly interface

### User Experience
- ✅ **GOV.UK Design System**: Consistent, accessible government styling
- ✅ **Form Validation**: Client-side and server-side validation with error display
- ✅ **Error Handling**: Graceful error messages and fallbacks
- ✅ **Loading States**: User feedback during API operations
- ✅ **Confirmation Dialogs**: Prevent accidental deletions

### Accessibility
- ✅ **WCAG 2.1 Compliant**: Following GOV.UK accessibility standards
- ✅ **Screen Reader Support**: Proper ARIA labels and semantic HTML
- ✅ **Keyboard Navigation**: Full keyboard accessibility
- ✅ **Focus Management**: Clear focus indicators and logical tab order

## 🏗️ Architecture

### Tech Stack
- **Framework**: Express.js with TypeScript
- **Templating**: Nunjucks with GOV.UK components
- **Styling**: SCSS with GOV.UK Frontend
- **Validation**: Client-side JavaScript + Server-side validation
- **Testing**: Jest with Supertest and Nock for API mocking
- **Build**: Webpack for asset bundling

### Project Structure
```
src/
├── main/
│   ├── app.ts                          # Express application setup
│   ├── server.ts                       # Server configuration
│   ├── assets/
│   │   ├── js/
│   │   │   ├── index.ts               # Main JavaScript entry
│   │   │   └── task-validation.js     # Client-side validation
│   │   └── scss/
│   │       └── main.scss              # Main stylesheet
│   ├── routes/
│   │   └── home.ts                    # Task management routes
│   ├── types/
│   │   └── task.d.ts                  # TypeScript definitions
│   └── views/
│       ├── template.njk               # Base template
│       ├── home.njk                   # Task dashboard
│       ├── error.njk                  # Error page
│       ├── not-found.njk              # 404 page
│       └── tasks/
│           ├── create.njk             # Task creation form
│           ├── edit.njk               # Task editing form  
│           └── view.njk               # Task details view
└── test/
    ├── config.ts                      # Test configuration
    ├── functional/                    # End-to-end tests
    ├── routes/
    │   └── home.ts                    # Route testing
    └── unit/                          # Unit tests
```

## 🌐 Pages & Routes

### Dashboard (`/`)
- **Features**: Task overview, statistics, filtering, search
- **Components**: Statistics cards, task table, filter controls
- **Actions**: View, edit, delete, quick status updates

### Task Creation (`/tasks/create`)
- **Features**: Form with validation, due date picker
- **Validation**: Title, description, optional due date
- **Actions**: Create task, cancel

### Task Details (`/tasks/:id`)
- **Features**: Full task information, action buttons
- **Actions**: Edit, delete, status updates, navigation

### Task Editing (`/tasks/:id/edit`)
- **Features**: Pre-populated form, validation
- **Actions**: Update task, cancel

### Search & Filtering
- **Filter by Status**: `/tasks/filter/:status`
- **Search**: `/tasks/search?q=query`

## 🎨 UI Components

### GOV.UK Design System Components Used
- **Forms**: Input, Textarea, Select, Date input, Button
- **Navigation**: Back link, Breadcrumbs  
- **Feedback**: Error summary, Error messages, Tags
- **Content**: Summary list, Table, Panel, Details
- **Layout**: Grid system, Typography, Spacing

### Custom Enhancements
- **Statistics Cards**: Task overview metrics
- **Status Tags**: Color-coded task status indicators
- **Action Buttons**: Context-sensitive task actions
- **Overdue Indicators**: Visual warnings for overdue tasks

## ⚡ Form Validation

### Client-Side Validation (`task-validation.js`)
- **Real-time feedback**: Immediate validation on form submit
- **Error highlighting**: Visual indicators on invalid fields
- **Date validation**: Comprehensive due date checking
- **User experience**: Prevents unnecessary server requests

### Server-Side Validation
- **Input sanitization**: Trim whitespace, validate required fields
- **Business rules**: Task title length, description requirements
- **Date validation**: Due date format and logic validation
- **Error display**: Structured error messages with field references

### Validation Rules
- **Title**: Required, minimum 3 characters
- **Description**: Required, minimum 10 characters  
- **Due Date**: Optional, must be complete (day/month/year) or empty
- **Status**: Must be valid enum value

## 🧪 Testing

### Test Framework
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP endpoint testing
- **Nock**: HTTP request mocking
- **Chai**: Additional assertions

### Test Coverage
```bash
# Run all tests
npm test

# Run route tests specifically  
npm run test:routes

# Run with coverage
npm run test:coverage

# Run functional tests
npm run test:functional
```

### Test Types
- **Route Tests**: API integration, error handling, validation
- **Unit Tests**: Individual component logic
- **Functional Tests**: End-to-end user workflows

## 🔧 Configuration

### Environment Variables
```bash
# Backend API URL
BACKEND_URL=http://localhost:8080

# Development mode
NODE_ENV=development

# Port configuration
PORT=3000
```

### Package Scripts
```json
{
  "start": "Production server startup",
  "start:dev": "Development server with hot reload",
  "build": "Build production assets", 
  "build:prod": "Optimized production build",
  "test": "Run unit tests",
  "test:routes": "Run route tests",
  "test:coverage": "Test coverage report",
  "test:functional": "End-to-end tests",
  "lint": "Code linting and formatting",
  "lint:fix": "Auto-fix linting issues"
}
```

## 🎯 API Integration

### Backend Communication
All API calls use Axios with proper error handling:

```typescript
// Example API integration
const response = await axios.get(`${BACKEND_URL}/api/tasks`);
```

### Error Handling
- **Network Errors**: Graceful fallbacks with user-friendly messages
- **API Errors**: Structured error display with field-specific feedback
- **Timeout Handling**: Request timeouts with retry options
- **Loading States**: User feedback during API operations

### Expected API Structure
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskStatistics {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
}
```

## 🚀 Deployment

### Development
```bash
npm run start:dev
```
- Hot reload enabled
- Development middleware active
- Console logging enabled

### Production Build
```bash
npm run build:prod
npm start
```
- Optimized assets
- Minified JavaScript/CSS
- Production error handling

### Environment Setup
1. Ensure backend is running on port 8080
2. Install dependencies: `npm install`
3. Build assets: `npm run build`
4. Start server: `npm run start:dev`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Mobile Features
- Touch-friendly buttons and forms
- Optimized table layouts
- Collapsible navigation
- Accessible form controls

## ♿ Accessibility Features

### WCAG 2.1 Compliance
- **AA Level**: Meeting government accessibility standards
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Support**: Screen reader compatibility
- **Color Contrast**: Meeting 4.5:1 minimum ratio
- **Focus Management**: Clear focus indicators

### Testing Tools
- **Axe-core**: Automated accessibility testing
- **Screen Readers**: Manual testing with NVDA/JAWS
- **Keyboard Testing**: Full keyboard navigation verification

## 🔍 Debugging

### Development Tools
- **Browser DevTools**: Network, Console, Elements inspection
- **Node.js Debugging**: VS Code integration
- **Hot Reload**: Instant feedback on changes
- **Source Maps**: Original TypeScript debugging

### Logging
```typescript
// Request logging in development
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## 🤝 Contributing

### Development Workflow
1. Install dependencies: `npm install`
2. Start development server: `npm run start:dev`
3. Make changes and test
4. Run linting: `npm run lint:fix`  
5. Run tests: `npm test`
6. Build for production: `npm run build:prod`

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Standard configuration
- **Prettier**: Automatic code formatting
- **Nunjucks**: GOV.UK template conventions

## 📝 License

This project is part of the HMCTS development test and is intended for evaluation purposes.

---

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Asset Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Backend Connection Issues
- Verify backend is running on port 8080
- Check `BACKEND_URL` environment variable
- Review CORS configuration if needed

#### Template Errors
- Ensure all required GOV.UK components are installed
- Verify template paths in route handlers
- Check Nunjucks configuration

### Support
For implementation questions:
1. Review the comprehensive route handlers in `src/main/routes/home.ts`
2. Check the template examples in `src/main/views/`
3. Examine test cases for expected behavior
4. Verify API integration patterns 
