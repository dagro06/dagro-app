const SLACK_API_BASE = "https://slack.com/api";
const SLACK_AUTH_URL = "https://slack.com/oauth/v2/authorize";

interface SlackTokenResponse {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id?: string;
  app_id: string;
  team: {
    id: string;
    name: string;
  };
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
}

interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  profile: {
    email?: string;
    image_48?: string;
    image_72?: string;
    display_name?: string;
  };
}

interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  thread_ts?: string;
  channel?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_im: boolean;
  is_mpim: boolean;
}

export function getSlackAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) throw new Error("SLACK_CLIENT_ID not configured");

  const scopes = [
    "channels:history",
    "channels:read",
    "groups:history",
    "groups:read",
    "im:history",
    "im:read",
    "mpim:history",
    "mpim:read",
    "users:read",
    "users:read.email",
  ].join(",");

  const userScopes = [
    "channels:history",
    "channels:read",
    "groups:history",
    "groups:read",
    "im:history",
    "im:read",
  ].join(",");

  return `${SLACK_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&user_scope=${userScopes}&state=${state}`;
}

export async function exchangeSlackCode(
  code: string,
  redirectUri: string
): Promise<SlackTokenResponse> {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Slack credentials not configured");
  }

  const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack token exchange failed: ${data.error}`);
  }

  return data;
}

export async function getSlackUser(
  accessToken: string,
  userId: string
): Promise<SlackUser> {
  const response = await fetch(
    `${SLACK_API_BASE}/users.info?user=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Failed to fetch Slack user: ${data.error}`);
  }

  return data.user;
}

export async function getSlackChannels(
  accessToken: string
): Promise<SlackChannel[]> {
  const response = await fetch(
    `${SLACK_API_BASE}/conversations.list?types=public_channel,private_channel,im,mpim&limit=200`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Failed to fetch Slack channels: ${data.error}`);
  }

  return data.channels;
}

export async function getSlackMessages(
  accessToken: string,
  channelId: string,
  options?: {
    limit?: number;
    oldest?: string;
    latest?: string;
  }
): Promise<SlackMessage[]> {
  const params = new URLSearchParams({
    channel: channelId,
    limit: String(options?.limit || 50),
  });

  if (options?.oldest) params.set("oldest", options.oldest);
  if (options?.latest) params.set("latest", options.latest);

  const response = await fetch(
    `${SLACK_API_BASE}/conversations.history?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Failed to fetch Slack messages: ${data.error}`);
  }

  return data.messages;
}

export async function postSlackMessage(
  accessToken: string,
  channelId: string,
  text: string,
  threadTs?: string
): Promise<SlackMessage> {
  const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: channelId,
      text,
      thread_ts: threadTs,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Failed to post Slack message: ${data.error}`);
  }

  return data.message;
}

export function slackTimestampToDate(ts: string): Date {
  return new Date(parseFloat(ts) * 1000);
}
