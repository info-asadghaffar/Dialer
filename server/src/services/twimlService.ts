import twilio from 'twilio';

const { VoiceResponse, MessagingResponse } = twilio.twiml;

/**
 * Builds TwiML for an outbound call (Voice SDK).
 */
export function buildOutboundCallTwiml(to: string, callerId: string): string {
  const response = new VoiceResponse();
  const dial = response.dial({
    callerId,
    record: 'record-from-answer-dual',
    recordingStatusCallback: `${process.env.WEBHOOK_URL}/webhooks/call/recording`
  });
  dial.number(to);
  return response.toString();
}

/**
 * Builds TwiML for an inbound call (Voice SDK).
 */
export function buildInboundCallTwiml(clientIdentity: string): string {
  const response = new VoiceResponse();
  response.dial().client(clientIdentity);
  return response.toString();
}

/**
 * Empty TwiML response for SMS webhooks or completion.
 */
export function buildEmptySmsResponse(): string {
  const response = new MessagingResponse();
  return response.toString();
}
