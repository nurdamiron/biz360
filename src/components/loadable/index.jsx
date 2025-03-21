// src/components/loadable/index.jsx
import { Suspense } from 'react';
import { LoadingScreen } from '../loading-screen';

// ----------------------------------------------------------------------

export const Loadable = (Component) => {
  // Create a proper function component that can use hooks
  const LoadableComponent = (props) => (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
  
  // Return the wrapped component
  return LoadableComponent;
};