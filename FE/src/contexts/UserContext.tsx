import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  // Add other user properties as needed
}

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  login: (userData: User, token: string | null) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ id: null, name: null, email: null });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData: User, token: string | null) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Optionally store the token (e.g., in localStorage or a secure cookie)
    if (token) {
      localStorage.setItem('authToken', token);
    }
  };

  const logout = () => {
    setUser({ id: null, name: null, email: null });
    setIsAuthenticated(false);
    localStorage.removeItem('authToken'); // Clear the token
    // Optionally clear cookies or perform other logout actions
  };

  const validateToken = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      setIsAuthenticated(false);
      setUser({ id: null, name: null, email: null });
      return false;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        // Optionally fetch user data here if needed and update the 'user' state
        // const userData = await response.json();
        // setUser(userData);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser({ id: null, name: null, email: null });
        localStorage.removeItem('authToken');
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser({ id: null, name: null, email: null });
      localStorage.removeItem('authToken');
      return false;
    }
  };

  // Check for an existing token on component mount and validate it
  useEffect(() => {
    validateToken();
  }, []);

  const value: UserContextType = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    validateToken,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};