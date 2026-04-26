import { ref } from 'vue'
import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  ClientSubscription,
  AttributeIds,
  TimestampsToReturn,
  coerceNodeId,
} from '@wsopcua/wsopcua'

export const temperature = ref(0)
export const position = ref(0)
export const trafficLight = ref(0)
export const connectionStatus = ref('Disconnected')
export const endpointUrl = ref(`ws://${window.location.hostname || 'localhost'}:4444`)

let currentClient: any = null

export async function connectOpcua() {
  if (currentClient) {
    await currentClient.disconnectP()
  }

  const client = new OPCUAClient({
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpoint_must_exist: false,
    connectionStrategy: {
      maxRetry: 5,
      initialDelay: 1000,
      maxDelay: 5000,
    },
  })
  currentClient = client

  try {
    connectionStatus.value = 'Connecting...'
    console.log(`[OPC UA] Connecting to ${endpointUrl.value}...`)
    await client.connectP(endpointUrl.value)
    connectionStatus.value = 'Connected'

    const session = await client.createSessionP({})

    const subscription = new ClientSubscription(session, {
      requestedPublishingInterval: 50,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 1,
      maxNotificationsPerPublish: 100,
      publishingEnabled: true,
      priority: 10,
    })

    subscription.on('started', (id: number) => {
      console.log('[OPC UA] Subscription started, id=' + id)
      console.log('[OPC UA] revisedPublishingInterval=' + (subscription as any)._publishingInterval)
      console.log('[OPC UA] revisedLifetimeCount=' + (subscription as any).lifetimeCount)
      console.log('[OPC UA] revisedMaxKeepAliveCount=' + (subscription as any).maxKeepAliveCount)
    })

    subscription.on('terminated', () => {
      console.log('[OPC UA] Subscription terminated')
    })

    let changeCount = 0
    let lastLog = Date.now()

    const itemsToMonitor = [
      { nodeId: coerceNodeId('ns=1;s=Temperature'), attributeId: AttributeIds.Value },
      { nodeId: coerceNodeId('ns=1;s=Position'), attributeId: AttributeIds.Value },
      { nodeId: coerceNodeId('ns=1;s=TrafficLight'), attributeId: AttributeIds.Value },
    ]

    const monitoredItemGroup = await subscription.monitorItemsP(
      itemsToMonitor,
      {
        samplingInterval: 50,
        discardOldest: true,
        queueSize: 3,
      },
      TimestampsToReturn.Both
    )

    monitoredItemGroup.on('changed', (_item, dataValue, index) => {
      const value = dataValue.value?.value
      if (index === 0) temperature.value = value ?? 0
      if (index === 1) position.value = value ?? 0
      if (index === 2) trafficLight.value = value ?? 0
      changeCount++
      const now = Date.now()
      if (now - lastLog >= 1000) {
        console.log(`[OPC UA] ${changeCount} changes in last ${now - lastLog}ms`)
        changeCount = 0
        lastLog = now
      }
    })

    window.addEventListener('beforeunload', () => {
      client.disconnectP()
    })
  } catch (err) {
    connectionStatus.value = 'Error: ' + (err as Error).message
    console.error('[OPC UA] Connection error:', err)
  }
}
