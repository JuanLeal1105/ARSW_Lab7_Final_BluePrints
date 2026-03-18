import { io } from 'socket.io-client'

const IO_BASE = import.meta.env.VITE_IO_BASE ?? 'http://localhost:3001'

export function createSocket() {
  const socket = io(IO_BASE, { transports: ['websocket'] })
  return socket
}