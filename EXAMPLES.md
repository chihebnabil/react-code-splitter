# Transformation Examples

This document shows real examples of how the transform modifies your code.

## Example 1: Basic Component Extraction

### Before Transform

```jsx
// UserProfile.jsx
import React from 'react';

function UserProfile() {
  const userName = "Jane Doe";
  const userEmail = "jane@example.com";
  const userRole = "Developer";
  const joinDate = "January 2024";
  
  return (
    <div className="profile">
      <header className="profile-header">
        <h1>{userName}</h1>
        <p>{userEmail}</p>
        <span className="role">{userRole}</span>
      </header>
      
      <section className="profile-details">
        <div className="detail-item">
          <label>Role:</label>
          <span>{userRole}</span>
        </div>
        <div className="detail-item">
          <label>Member Since:</label>
          <span>{joinDate}</span>
        </div>
        <div className="detail-item">
          <label>Email:</label>
          <span>{userEmail}</span>
        </div>
      </section>
      
      <footer className="profile-footer">
        <button>Edit Profile</button>
        <button>View Activity</button>
        <button>Settings</button>
      </footer>
    </div>
  );
}

export default UserProfile;
```

### Command Run

```bash
jscodeshift -t split-components.js --minElements=3 UserProfile.jsx
```

### After Transform

```jsx
// UserProfile.jsx
import React from 'react';
import ProfileHeader from './components/ProfileHeader';
import ProfileDetails from './components/ProfileDetails';
import ProfileFooter from './components/ProfileFooter';

function UserProfile() {
  const userName = "Jane Doe";
  const userEmail = "jane@example.com";
  const userRole = "Developer";
  const joinDate = "January 2024";
  
  return (
    <div className="profile">
      <ProfileHeader userName={userName} userEmail={userEmail} userRole={userRole} />
      <ProfileDetails userRole={userRole} joinDate={joinDate} userEmail={userEmail} />
      <ProfileFooter />
    </div>
  );
}

export default UserProfile;
```

```jsx
// components/ProfileHeader.jsx
import React from 'react';

function ProfileHeader({ userName, userEmail, userRole }) {
  return (
    <header className="profile-header">
      <h1>{userName}</h1>
      <p>{userEmail}</p>
      <span className="role">{userRole}</span>
    </header>
  );
}

export default ProfileHeader;
```

```jsx
// components/ProfileDetails.jsx
import React from 'react';

function ProfileDetails({ userRole, joinDate, userEmail }) {
  return (
    <section className="profile-details">
      <div className="detail-item">
        <label>Role:</label>
        <span>{userRole}</span>
      </div>
      <div className="detail-item">
        <label>Member Since:</label>
        <span>{joinDate}</span>
      </div>
      <div className="detail-item">
        <label>Email:</label>
        <span>{userEmail}</span>
      </div>
    </section>
  );
}

export default ProfileDetails;
```

```jsx
// components/ProfileFooter.jsx
import React from 'react';

function ProfileFooter() {
  return (
    <footer className="profile-footer">
      <button>Edit Profile</button>
      <button>View Activity</button>
      <button>Settings</button>
    </footer>
  );
}

export default ProfileFooter;
```

---

## Example 2: Targeted Extraction by Selector

### Before Transform

```jsx
// Dashboard.jsx
import React from 'react';

function Dashboard() {
  const stats = { views: 1000, likes: 500 };
  
  return (
    <div className="dashboard">
      <nav className="sidebar">
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>
      <main>
        <h1>Dashboard</h1>
        <p>Views: {stats.views}</p>
        <p>Likes: {stats.likes}</p>
      </main>
    </div>
  );
}

export default Dashboard;
```

### Command Run

```bash
jscodeshift -t split-by-selector.js --selector="nav" --name="Sidebar" Dashboard.jsx
```

### After Transform

```jsx
// Dashboard.jsx
import React from 'react';
import Sidebar from './components/Sidebar';

function Dashboard() {
  const stats = { views: 1000, likes: 500 };
  
  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <h1>Dashboard</h1>
        <p>Views: {stats.views}</p>
        <p>Likes: {stats.likes}</p>
      </main>
    </div>
  );
}

export default Dashboard;
```

```jsx
// components/Sidebar.jsx
import React from 'react';

function Sidebar() {
  return (
    <nav className="sidebar">
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/profile">Profile</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  );
}

export default Sidebar;
```

---

## Example 3: Class Component

### Before Transform

```jsx
// TodoList.jsx
import React from 'react';

class TodoList extends React.Component {
  render() {
    const todos = this.props.todos;
    const onComplete = this.props.onComplete;
    
    return (
      <div className="todo-list">
        <header className="todo-header">
          <h1>My Todos</h1>
          <button>Add New</button>
        </header>
        
        <ul className="todo-items">
          {todos.map(todo => (
            <li key={todo.id}>
              <span>{todo.text}</span>
              <button onClick={() => onComplete(todo.id)}>
                Complete
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default TodoList;
```

### Command Run

```bash
jscodeshift -t split-components.js --minElements=2 TodoList.jsx
```

### After Transform

```jsx
// TodoList.jsx
import React from 'react';
import TodoHeader from './components/TodoHeader';
import TodoItems from './components/TodoItems';

class TodoList extends React.Component {
  render() {
    const todos = this.props.todos;
    const onComplete = this.props.onComplete;
    
    return (
      <div className="todo-list">
        <TodoHeader />
        <TodoItems todos={todos} onComplete={onComplete} />
      </div>
    );
  }
}

export default TodoList;
```

```jsx
// components/TodoHeader.jsx
import React from 'react';

function TodoHeader() {
  return (
    <header className="todo-header">
      <h1>My Todos</h1>
      <button>Add New</button>
    </header>
  );
}

export default TodoHeader;
```

```jsx
// components/TodoItems.jsx
import React from 'react';

function TodoItems({ todos, onComplete }) {
  return (
    <ul className="todo-items">
      {todos.map(todo => (
        <li key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => onComplete(todo.id)}>
            Complete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TodoItems;
```

---

## Example 4: Nested Components

### Before Transform

```jsx
// ComplexForm.jsx
import React from 'react';

function ComplexForm() {
  const name = "";
  const email = "";
  const password = "";
  
  return (
    <div className="form-container">
      <form>
        <section className="personal-info">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} />
          </div>
        </section>
        
        <section className="security">
          <h2>Security</h2>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" />
          </div>
        </section>
        
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </form>
    </div>
  );
}

export default ComplexForm;
```

### After Transform (with --minElements=3)

```jsx
// ComplexForm.jsx
import React from 'react';
import PersonalInfo from './components/PersonalInfo';
import Security from './components/Security';

function ComplexForm() {
  const name = "";
  const email = "";
  const password = "";
  
  return (
    <div className="form-container">
      <form>
        <PersonalInfo name={name} email={email} />
        <Security password={password} />
        
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </form>
    </div>
  );
}

export default ComplexForm;
```

---

## Dry Run Output

When you run with `--dry`, you'll see output like:

```
[DRY RUN] Would create: ProfileHeader with props: userName, userEmail, userRole
[DRY RUN] Would create: ProfileDetails with props: userRole, joinDate, userEmail
[DRY RUN] Would create: ProfileFooter with props: 

Processing 1 file...
Spawning 1 worker...
Sending 1 files to free worker...
All done.
Results:
0 errors
0 unmodified
0 skipped
0 ok
Time elapsed: 0.123s
```

This allows you to preview what will be extracted before actually modifying files.

## Tips for Best Results

1. **Start with higher --minElements**: Use 5-7 for first pass
2. **Use meaningful classNames**: They help with auto-naming
3. **Review generated components**: Always check the output
4. **Adjust props manually**: Some complex props need refinement
5. **Run tests after**: Ensure functionality is preserved
