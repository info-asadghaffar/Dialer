import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const { VoiceGrant } = AccessToken;

/**
 * Generates a Twilio Access Token for the Voice SDK with appropriate grants.
 */
export function generateAccessToken(params: {
  identity: string;
  accountSid: string;
  apiKey: string;
  apiSecret: string;
  twimlAppSid: string;
}): string {
  const token = new AccessToken(
    params.accountSid,
    params.apiKey,
    params.apiSecret,
    { 
      identity: params.identity, 
      ttl: 3600 // 1 hour 
    }
  );

  const grant = new VoiceGrant({
    outgoingApplicationSid: params.twimlAppSid,
    incomingAllow: true // Allow receiving calls at this identity
  });

  token.addGrant(grant);
  return token.toJwt();
}
