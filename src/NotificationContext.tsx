import React, { createContext, useContext, ReactNode } from 'react';
import { NotificationService } from './utils/notificationService';

const NotificationContext = createContext<NotificationService | null>(null);

export const NotificationProvider: React.FC<{ 
  service?: NotificationService; 
  children: ReactNode 
}> = ({ service, children }) => {
  const notificationService = service || new NotificationService();
  
  return (
    <NotificationContext.Provider value={notificationService}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationService = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationService must be used within a NotificationProvider');
  }
  return context;
};
