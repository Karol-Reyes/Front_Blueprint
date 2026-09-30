import { Client } from '@stomp/stompjs'

export function createStompClient(baseUrl) {
  const endpoint = new URL('/ws-blueprints', baseUrl)
  if (endpoint.protocol === 'http:') endpoint.protocol = 'ws:'
  if (endpoint.protocol === 'https:') endpoint.protocol = 'wss:'

  return new Client({
    brokerURL: endpoint.toString(),
    reconnectDelay: 1500,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  })
}

export function subscribeBlueprint(client, author, name, onMessage) {
  const topic = `/topic/blueprints.${author}.${name}`
  return client.subscribe(topic, (message) => onMessage(JSON.parse(message.body)))
}