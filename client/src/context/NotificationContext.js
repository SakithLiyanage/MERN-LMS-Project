import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      // Optionally handle error
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}; 