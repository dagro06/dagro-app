const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";
const AUTH_URL = "https://login.microsoftonline.com";

interface MicrosoftTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface OutlookUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

interface OutlookMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  importance: string;
}

interface OutlookMailFolder {
  id: string;
  displayName: string;
  totalItemCount: number;
  unreadItemCount: number;
}

export function getOutlookAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";

  if (!clientId) throw new Error("MICROSOFT_CLIENT_ID not configured");

  const scopes = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "Mail.Read",
    "Mail.Send",
    "User.Read",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    response_mode: "query",
  });

  return `${AUTH_URL}/${tenantId}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeOutlookCode(
  code: string,
  redirectUri: string
): Promise<MicrosoftTokenResponse> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";

  if (!clientId || !clientSecret) {
    throw new Error("Microsoft credentials not configured");
  }

  const response = await fetch(
    `${AUTH_URL}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft token exchange failed: ${error}`);
  }

  return response.json();
}

export async function refreshOutlookToken(
  refreshToken: string
): Promise<MicrosoftTokenResponse> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";

  if (!clientId || !clientSecret) {
    throw new Error("Microsoft credentials not configured");
  }

  const response = await fetch(
    `${AUTH_URL}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft token refresh failed: ${error}`);
  }

  return response.json();
}

export async function getOutlookUser(
  accessToken: string
): Promise<OutlookUser> {
  const response = await fetch(`${GRAPH_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Outlook user");
  }

  return response.json();
}

export async function getOutlookFolders(
  accessToken: string
): Promise<OutlookMailFolder[]> {
  const response = await fetch(`${GRAPH_API_BASE}/me/mailFolders`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch mail folders");
  }

  const data = await response.json();
  return data.value;
}

export async function getOutlookMessages(
  accessToken: string,
  options?: {
    folderId?: string;
    top?: number;
    skip?: number;
    filter?: string;
    orderby?: string;
  }
): Promise<OutlookMessage[]> {
  const folderId = options?.folderId || "inbox";
  const params = new URLSearchParams();

  if (options?.top) params.set("$top", String(options.top));
  if (options?.skip) params.set("$skip", String(options.skip));
  if (options?.filter) params.set("$filter", options.filter);
  params.set("$orderby", options?.orderby || "receivedDateTime desc");
  params.set(
    "$select",
    "id,subject,bodyPreview,body,from,receivedDateTime,isRead,hasAttachments,importance"
  );

  const url = `${GRAPH_API_BASE}/me/mailFolders/${folderId}/messages?${params}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Outlook messages: ${error}`);
  }

  const data = await response.json();
  return data.value;
}

export async function getOutlookMessage(
  accessToken: string,
  messageId: string
): Promise<OutlookMessage> {
  const response = await fetch(`${GRAPH_API_BASE}/me/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch message");
  }

  return response.json();
}

export async function markOutlookMessageRead(
  accessToken: string,
  messageId: string,
  isRead: boolean
): Promise<void> {
  const response = await fetch(`${GRAPH_API_BASE}/me/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isRead }),
  });

  if (!response.ok) {
    throw new Error("Failed to update message");
  }
}

export async function sendOutlookMessage(
  accessToken: string,
  to: string[],
  subject: string,
  content: string,
  contentType: "Text" | "HTML" = "HTML"
): Promise<void> {
  const response = await fetch(`${GRAPH_API_BASE}/me/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType,
          content,
        },
        toRecipients: to.map((email) => ({
          emailAddress: { address: email },
        })),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message: ${error}`);
  }
}
