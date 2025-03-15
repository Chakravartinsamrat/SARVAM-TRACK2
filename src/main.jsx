import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';

import './index.css';
import routes from './routers/routes';  

import SnackbarProvider from './contexts/SnackbarContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider>
      <RouterProvider router={routes} />
    </SnackbarProvider>
  </StrictMode>,
)
