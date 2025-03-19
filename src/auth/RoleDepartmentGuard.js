// src/auth/RoleDepartmentGuard.jsx
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useAuthContext } from './hooks';

// src/auth/RoleDepartmentGuard.jsx
export default function RoleDepartmentGuard({ children, hasPermission, accessDeniedPath }) {
    const authContext = useAuthContext();
    const { employee, authenticated, loading } = authContext || {};
    const navigate = useNavigate();
    const params = useParams();
    const [checked, setChecked] = useState(false);
  
    useEffect(() => {
      // Don't do anything while still loading
      if (loading) {
        return;
      }
  
      // If not authenticated, redirect to login
      if (!authenticated) {
        navigate(paths.auth.jwt.signIn, { replace: true });
        return;
      }
  
      // Add params to user object for permission checking
      const userWithParams = {
        employee,
        params,
      };
  
      try {
        // Check permissions with provided function or default to true if in development
        const hasAccess = process.env.NODE_ENV === 'development' || hasPermission(userWithParams);
        
        if (!hasAccess) {
          // Redirect to access denied path if no permission
          navigate(accessDeniedPath || paths.dashboard.metrics.employee('me'), { replace: true });
        } else {
          setChecked(true);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        // In case of error, allow access in development
        if (process.env.NODE_ENV === 'development') {
          setChecked(true);
        } else {
          navigate(accessDeniedPath || paths.dashboard.metrics.employee('me'), { replace: true });
        }
      }
    }, [loading, authenticated, employee, params, hasPermission, navigate, accessDeniedPath]);
  
    // Don't render anything until check is complete
    if (loading || !checked) {
      return null;
    }
  
    // Return children if permission check passed
    return children;
  }