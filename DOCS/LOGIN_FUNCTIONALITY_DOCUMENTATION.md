# Sign-In (Login) Functionality Documentation

## Overview

This document provides a comprehensive analysis of the sign-in (login) functionality found in the React application, including UI/UX design, API integration patterns, authentication flow, and implementation details needed to recreate this system on different technology stacks.

## Table of Contents

1. [UI/UX Design](#uiux-design)
2. [Authentication Flow](#authentication-flow)
3. [API Integration](#api-integration)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Security Features](#security-features)
7. [Storage Management](#storage-management)
8. [Route Protection](#route-protection)
9. [Localization](#localization)
10. [Implementation Guide](#implementation-guide)

## UI/UX Design

### Login Form Layout

**File**: `src/pages/Login/Login.jsx`

The login form follows a clean, centered card design:

```jsx
// Key UI Structure
<LoginForm>  // Styled Card component
  <Logotype />  // Company logo
  <Form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
    <FormGroup>
      <Label>Username</Label>
      <Input type="text" maxLength="512" autoFocus />
    </FormGroup>
    <FormGroup>
      <Label>Password</Label>
      <InputPassword>  // Custom password component with toggle
        <Input type="password" maxLength="100" />
      </InputPassword>
    </FormGroup>
    <Button type="submit" disabled={validateForm()} block>
      Log in
    </Button>
  </Form>
</LoginForm>
```

### Visual Design Specifications

**File**: `src/pages/Login/styled/styled.js`

#### Login Form Card
- **Background**: `#f7f7f7` (light gray)
- **Size**: Max width 380px, auto-centered
- **Spacing**: 20px padding, 10% top margin
- **Logo**: 80px height, centered

#### Form Elements
- **Input Fields**: Standard reactstrap styling with custom error states
- **Error States**: Red border (`#ED573B`) with subtle red glow shadow
- **Button**: Primary color, full width, disabled when form invalid

#### Password Input Component

**File**: `src/components/InputPassword.jsx`

Features:
- **Toggle Visibility**: Eye icon to show/hide password
- **Custom Font**: Uses special 'password' font for hidden characters
- **Focus Management**: Maintains cursor position during toggle
- **Timeout Hide**: Auto-hides toggle button after 200ms of blur

### Form Validation

#### Client-Side Validation Rules
- **Required Fields**: Both username and password must be non-empty
- **Length Limits**: Username (512 chars), Password (100 chars)
- **Real-time Validation**: Button disabled until both fields filled
- **Error Display**: Red styling and error messages below fields

#### Form Behavior
- **Auto-focus**: Username field gets focus on load
- **Enter Key**: Submits form when pressed
- **Loading States**: Form disabled during submission
- **Error States**: Visual feedback for authentication failures

## Authentication Flow

### Initial Load Sequence

1. **Storage Cleanup**: Clear existing auth tokens
2. **Database Info**: Load app instance information
3. **No-Auth Check**: Test if authentication is required
4. **Token Check**: Look for temporary tokens in URL
5. **Form Display**: Show login form if no valid authentication

### Authentication Methods

#### 1. Standard Login/Password
```javascript
// Standard authentication flow
const loginCredentials = {
  username: userInput,
  password: passwordInput
}
```

#### 2. Temporary Token Authentication
```javascript
// URL pattern: ?tempuid=<token>
const match = window.location.search.match(/^\?tempuid=([a-zA-Z\d]+)$/);
if (match.length && match[1]) {
  // Use special '__tempuid__' username with token as password
  loginUser({login: '__tempuid__', password: match[1]})
}
```

#### 3. No-Authentication Mode
```javascript
// Check if system requires authentication
checkNoLogin().then((response) => {
  if (response.status === 404) {
    // Skip login, grant access immediately
    dispatch(loginAction(true));
  }
});
```

### Login Process Steps

1. **Form Submission**
   - Validate required fields
   - Clear previous errors
   - Disable form during processing

2. **API Authentication**
   - Send OAuth2 request to server
   - Receive JWT and refresh tokens
   - Validate user role permissions

3. **Token Storage**
   - Store access token in localStorage
   - Store refresh token for auto-renewal
   - Update Redux state

4. **Route Redirect**
   - Navigate to main application
   - Enable protected routes

## API Integration

### OAuth2 Authentication Endpoint

**Endpoint**: `{serverUrl}connect/token`
**Method**: `POST`
**Content-Type**: `application/x-www-form-urlencoded`

#### Request Parameters
```javascript
const requestBody = new URLSearchParams({
  username: userName,
  password: password,
  client_id: "ext_client",
  client_secret: "ext_client_secret", 
  scope: "all offline_access",
  grant_type: "password"
});
```

#### Success Response (200)
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "refresh_token_value",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### Error Response (400)
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid username or password"
}
```

### JWT Token Structure

The access token contains:
- **Subject** (`sub`): User ID
- **Role** (`role`): User role ('Administrator' or 'User')
- **Expiration** (`exp`): Token expiry timestamp
- **Issuer** (`iss`): Token issuer
- **Audience** (`aud`): Token audience

### Token Refresh Mechanism

**Endpoint**: `{serverUrl}connect/token`
**Method**: `POST`

#### Refresh Request
```javascript
const refreshRequest = {
  scope: "refresh_token offline_access",
  refresh_token: storedRefreshToken,
  grant_type: "refresh_token",
  client_id: "ext_client",
  client_secret: "ext_client_secret"
};
```

#### Auto-Refresh Trigger
- **HTTP Interceptor**: Automatic on 401 responses
- **Location**: `src/utils/api.js`
- **Behavior**: Refresh token → Update storage → Reload page

### System Configuration Check

**Endpoint**: `{serverUrl}.well-known/openid-configuration`
**Method**: `GET`
**Purpose**: Determine if authentication is required

Response handling:
- **404**: No authentication required
- **200**: Authentication required
- **Other**: Authentication required (fallback)

## State Management

### Redux Store Structure

#### Auth State
```javascript
// State shape
{
  auth: "jwt_token_string" | null | true,  // true = no auth required
  errorLogin: {
    error: false | errorObject
  }
}
```

#### Auth Actions
```javascript
// Action types
ON_LOGIN = 'ON_LOGIN'           // Successful login
ON_LOGIN_ERROR = 'ON_LOGIN_ERROR' // Login error
LOGOUT_USER = 'LOGOUT_USER'     // User logout
```

#### Auth Reducer
```javascript
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case ON_LOGIN:
      return action.payload;  // JWT token
    case LOGOUT_USER:
      return {};
    default:
      return state;
  }
};
```

### Component State

#### Login Component State
```javascript
this.state = {
  login: '',           // Username input
  password: '',        // Password input
  error: '',          // Client-side error message
  isFormShow: false   // Form visibility flag
}
```

## Error Handling

### Error Types and Messages

#### Authentication Errors
- **Empty Fields**: "Username or password cannot be empty!"
- **Invalid Credentials**: "Wrong Username or password!"
- **Insufficient Rights**: "Not enough rights" (403 error)
- **Server Error**: Generic "Wrong Username or password!"

#### Error Display Logic
```javascript
// Error priority handling
const displayError = (response?.error === 403 && t('static.errors.403')) 
  || response?.message 
  || t('static.errors.auth');
```

### Error State Management

#### Visual Error Indicators
- **Input Styling**: Red borders and glow effects
- **Error Messages**: Red text below form fields
- **Form State**: Maintains error until successful submission

#### Error Recovery
- **Clear on Retry**: Errors cleared when form resubmitted
- **Auto-focus**: Username field refocused on error
- **State Persistence**: Error state maintained until resolved

## Security Features

### Role-Based Access Control

#### Supported Roles
- **Administrator**: Full system access
- **User**: Standard user access
- **Others**: Access denied (403 error)

#### Role Validation
```javascript
// JWT role validation
const jwtContent = parseJwt(accessToken);
if (jwtContent.role !== 'Administrator' && jwtContent.role !== 'User') {
  return {error: 403};
}
```

### Input Security

#### Input Sanitization
- **Max Length**: Username (512), Password (100)
- **Character Validation**: Standard text input validation
- **XSS Prevention**: Using controlled React inputs

#### Token Security
- **JWT Validation**: Server-side token verification
- **Refresh Tokens**: Automatic token renewal
- **Storage Isolation**: Database-specific storage keys

## Storage Management

### Token Storage

#### Storage Keys
```javascript
const storageKeys = {
  auth: 'auth',
  refreshToken: 'refresh_token',
  language: 'language'
};
```

#### Database-Specific Storage
```javascript
// Prefixed storage keys
const getStorageKey = (name) => `${databaseName}.${name}`;
```

#### Storage Operations
- **Set Token**: `localStorage.setItem(key, value)`
- **Get Token**: `localStorage.getItem(key)`
- **Remove Token**: `localStorage.removeItem(key)`
- **Clear All**: Database-specific clear operation

### Session Management

#### Logout Process
1. Remove auth token from storage
2. Remove refresh token from storage
3. Dispatch logout action
4. Reload page to clear state

#### Auto-Cleanup
- **Initial Load**: Clear existing tokens
- **Token Refresh**: Update stored tokens
- **Error Recovery**: Clear invalid tokens

## Route Protection

### Route Structure

**File**: `src/Routes.jsx`

```javascript
const Routes = () => {
  const isAuth = useSelector((state) => !!state.auth);
  
  return (
    <HashRouter>
      {!isAuth ? (
        <Route path="/" component={Login} />
      ) : (
        <Route path="/" component={Main} />
      )}
    </HashRouter>
  );
};
```

### Protection Logic

#### Authentication Check
```javascript
// State-based protection
const isAuthenticated = !!state.auth;
```

#### Route Behavior
- **Unauthenticated**: Show login page for all routes
- **Authenticated**: Show main application
- **Hash Router**: Uses hash-based routing

## Localization

### Translation Integration

**Framework**: react-i18next
**Files**: `src/translation/en/common.json`, `src/translation/ru/common.json`

#### Login-Related Translations
```json
{
  "static": {
    "login": "Username",
    "password": "Password",
    "button": {
      "enter": "Log in"
    },
    "errors": {
      "auth": "Wrong Username or password!",
      "emptyAuth": "Username or password cannot be empty!",
      "403": "Not enough rights"
    }
  }
}
```

#### Usage in Components
```javascript
// Translation hook usage
const { t } = useTranslation('common');
const errorMessage = t('static.errors.auth');
```

## Implementation Guide

### Tech Stack Requirements

#### Frontend
- **React 16+**: For component-based UI
- **Redux**: For state management
- **React Router**: For route protection
- **Axios/Fetch**: For API calls
- **Styled Components**: For styling (optional)

#### Backend
- **OAuth2 Server**: For authentication
- **JWT Support**: For token-based auth
- **CORS Support**: For cross-origin requests
- **Role Management**: For user permissions

### API Endpoints Needed

#### Authentication
- `POST /connect/token` - OAuth2 authentication
- `GET /.well-known/openid-configuration` - Auth config

#### User Management
- `GET /api/v1/Users` - Get user information
- Token refresh endpoint (built into OAuth2)

### Database Schema

#### Required Tables
```sql
-- Users table
CREATE TABLE Users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(512) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'User')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE RefreshTokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(1000) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
```

### Frontend Implementation Steps

#### 1. Setup Authentication State
```javascript
// Redux store setup
const initialState = {
  auth: localStorage.getItem('auth') || null,
  errorLogin: { error: false }
};
```

#### 2. Create Login Component
```javascript
// Login form with validation
const LoginForm = ({ onSubmit, loading, error }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  
  // Implementation details...
};
```

#### 3. Implement Authentication Service
```javascript
// API service
const authService = {
  login: async (credentials) => {
    const response = await fetch('/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
        client_id: 'ext_client',
        client_secret: 'ext_client_secret',
        scope: 'all offline_access',
        grant_type: 'password'
      })
    });
    
    return response.json();
  }
};
```

#### 4. Setup Route Protection
```javascript
// Protected route wrapper
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSelector(state => !!state.auth);
  
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};
```

### Backend Implementation Steps

#### 1. OAuth2 Server Setup
- Choose OAuth2 library (e.g., IdentityServer4, Spring Security OAuth)
- Configure client credentials
- Setup token endpoints

#### 2. JWT Token Generation
```javascript
// JWT token structure
const tokenPayload = {
  sub: user.id,
  role: user.role,
  iss: 'your-app',
  aud: 'your-app',
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  iat: Math.floor(Date.now() / 1000)
};
```

#### 3. User Authentication
```javascript
// Password verification
const authenticateUser = async (username, password) => {
  const user = await findUserByUsername(username);
  if (!user) throw new Error('Invalid credentials');
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error('Invalid credentials');
  
  if (!['Administrator', 'User'].includes(user.role)) {
    throw new Error('Insufficient privileges');
  }
  
  return user;
};
```

#### 4. Token Refresh Implementation
```javascript
// Refresh token handling
const refreshToken = async (refreshToken) => {
  const tokenRecord = await findRefreshToken(refreshToken);
  if (!tokenRecord || tokenRecord.expires_at < new Date()) {
    throw new Error('Invalid refresh token');
  }
  
  const user = await findUserById(tokenRecord.user_id);
  const newTokens = await generateTokens(user);
  
  await updateRefreshToken(tokenRecord.id, newTokens.refresh_token);
  return newTokens;
};
```

### Testing Considerations

#### Unit Tests
- Login form validation
- Authentication service calls
- State management updates
- Error handling scenarios

#### Integration Tests
- End-to-end login flow
- Token refresh functionality
- Route protection verification
- API endpoint testing

#### Security Tests
- SQL injection prevention
- XSS protection
- CSRF protection
- Token tampering protection

### Performance Considerations

#### Frontend Optimization
- Lazy loading for protected routes
- Token storage optimization
- Form validation debouncing
- Error message caching

#### Backend Optimization
- Database indexing on username
- Token caching strategy
- Rate limiting for login attempts
- Session cleanup processes

## Conclusion

This login system provides a robust, secure authentication solution with:

- **Clean UX**: Intuitive login form with proper validation
- **OAuth2 Integration**: Industry-standard authentication
- **JWT Tokens**: Stateless authentication with refresh capability
- **Role-Based Access**: Fine-grained permission control
- **Error Handling**: Comprehensive error management
- **Localization**: Multi-language support
- **Security**: Input validation, token management, and role verification

The documentation provides all necessary details to recreate this functionality on any technology stack while maintaining the same user experience and security standards. 