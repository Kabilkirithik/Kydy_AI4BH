import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from '@aws-sdk/client-bedrock-agentcore'

// ── Singleton client ──────────────────────────────────────────────────────────
const client = new BedrockAgentCoreClient({
  region: import.meta.env.VITE_AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId:     import.meta.env.VITE_AWS_ACCESS_KEY_ID     ?? '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ?? '',
  },
})

const agentRuntimeArn = import.meta.env.VITE_BEDROCK_AGENT_ARN ?? ''

// ── Main export ───────────────────────────────────────────────────────────────
export async function callBedrockAgent(prompt: string): Promise<{
  svg:            string
  topic:          string
  slug:           string
  animation_json: string
}> {
  if (!agentRuntimeArn) {
    throw new Error('Missing VITE_BEDROCK_AGENT_ARN in .env')
  }

  const command = new InvokeAgentRuntimeCommand({
    agentRuntimeArn,
    runtimeSessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    payload:          JSON.stringify({ prompt }),
    contentType:      'application/json',
    qualifier:        'DEFAULT',
  })

  const response = await client.send(command)

  // response.response is a streaming body — collect all chunks then decode
  const chunks: Uint8Array[] = []
  if (response.response) {
    const body = response.response
    // transformToByteArray() collects the full stream in one shot
    const bytes = await body.transformToByteArray()
    chunks.push(bytes)
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const merged      = new Uint8Array(totalLength)
  let offset        = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }

  const raw    = new TextDecoder().decode(merged)
  const parsed = JSON.parse(raw)

  return {
    svg:            parsed.svg            ?? '',
    topic:          parsed.topic          ?? '',
    slug:           parsed.slug           ?? '',
    animation_json: parsed.animation_json ?? '',
  }
}