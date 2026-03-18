import { Client } from '@stomp/stompjs'

const API_BASE = import.meta.env.VITE_STOMP_BASE ?? 'ws://localhost:8080'

export function createStompClient() {
  const client = new Client({
    brokerURL: `${API_BASE.replace(/\/$/,'')}/ws-blueprints`,
    reconnectDelay: 1000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onStompError: (f) => console.error('STOMP error', f.headers['message']),
  })
  return client
}

export function subscribeBlueprint(client, author, name, onMsg) {
  return client.subscribe(`/topic/blueprints.${author}.${name}`, (m) => {
    onMsg(JSON.parse(m.body))
  })
}