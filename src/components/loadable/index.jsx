// src/components/loadable/index.jsx
import { Suspense } from 'react';
import { LoadingScreen } from '../loading-screen';

// ----------------------------------------------------------------------

export const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);