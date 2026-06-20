import React, { createContext, useContext, useState, useEffect } from 'react'
import { notificationAPI } from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  const fetch = async () => {
    if (!user) return
    try {
      const res = await notificationAPI.list()
      setNotifications(res.data.notifications || [])
      setUnread(res.data.unread || 0)
    } catch {}
  }

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 60000)
    return () => clearInterval(interval)
  }, [user])

  const markRead = async (id) => {
    await notificationAPI.markRead(id)
    fetch()
  }

  return (
    <NotificationContext.Provider value={{ notifications, unread, markRead, refetch: fetch }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
