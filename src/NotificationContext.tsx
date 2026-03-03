import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { NotificationService } from './utils/notificationService';

const NotificationContext = createContext<NotificationService | null>(null);

export const NotificationProvider: React.FC<{ 
  service?: NotificationService; 
  children: ReactNode 
}> = ({ service, children }) => {
  const notificationService = useMemo(() => service || new NotificationService(), [service]);
  
  return (
    <NotificationContext.Provider value={notificationService}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationService = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationService must be used within a NotificationProvider');
  }
  return context;
};
