const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_AUTH_URL = "https://api.notion.com/v1/oauth/authorize";

interface NotionTokenResponse {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_icon?: string;
  owner: {
    type: string;
    user?: {
      id: string;
      name?: string;
      avatar_url?: string;
      type: string;
      person?: {
        email: string;
      };
    };
  };
}

interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  parent: {
    type: string;
    database_id?: string;
    page_id?: string;
    workspace?: boolean;
  };
  properties: Record<string, NotionProperty>;
  url: string;
}

interface NotionProperty {
  id: string;
  type: string;
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  [key: string]: unknown;
}

interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  created_time: string;
  last_edited_time: string;
  url: string;
}

interface NotionSearchResult {
  results: Array<NotionPage | NotionDatabase>;
  has_more: boolean;
  next_cursor?: string;
}

export function getNotionAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.NOTION_CLIENT_ID;
  if (!clientId) throw new Error("NOTION_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    owner: "user",
  });

  return `${NOTION_AUTH_URL}?${params}`;
}

export async function exchangeNotionCode(
  code: string,
  redirectUri: string
): Promise<NotionTokenResponse> {
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Notion credentials not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${NOTION_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion token exchange failed: ${error}`);
  }

  return response.json();
}

export async function searchNotion(
  accessToken: string,
  query?: string,
  filter?: { property: string; value: string }
): Promise<NotionSearchResult> {
  const body: Record<string, unknown> = {};

  if (query) body.query = query;
  if (filter) {
    body.filter = {
      property: filter.property,
      value: filter.value,
    };
  }

  const response = await fetch(`${NOTION_API_BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion search failed: ${error}`);
  }

  return response.json();
}

export async function getNotionPage(
  accessToken: string,
  pageId: string
): Promise<NotionPage> {
  const response = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Notion-Version": "2022-06-28",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Notion page");
  }

  return response.json();
}

export async function getNotionPageContent(
  accessToken: string,
  pageId: string
): Promise<unknown[]> {
  const response = await fetch(
    `${NOTION_API_BASE}/blocks/${pageId}/children?page_size=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": "2022-06-28",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Notion page content");
  }

  const data = await response.json();
  return data.results;
}

export async function getNotionDatabase(
  accessToken: string,
  databaseId: string
): Promise<NotionDatabase> {
  const response = await fetch(`${NOTION_API_BASE}/databases/${databaseId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Notion-Version": "2022-06-28",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Notion database");
  }

  return response.json();
}

export async function queryNotionDatabase(
  accessToken: string,
  databaseId: string,
  filter?: Record<string, unknown>,
  sorts?: Array<{ property: string; direction: "ascending" | "descending" }>
): Promise<NotionSearchResult> {
  const body: Record<string, unknown> = {};

  if (filter) body.filter = filter;
  if (sorts) body.sorts = sorts;

  const response = await fetch(
    `${NOTION_API_BASE}/databases/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion database query failed: ${error}`);
  }

  return response.json();
}

export async function createNotionPage(
  accessToken: string,
  parentId: string,
  parentType: "database_id" | "page_id",
  properties: Record<string, unknown>,
  children?: unknown[]
): Promise<NotionPage> {
  const body: Record<string, unknown> = {
    parent: { [parentType]: parentId },
    properties,
  };

  if (children) body.children = children;

  const response = await fetch(`${NOTION_API_BASE}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Notion page: ${error}`);
  }

  return response.json();
}

export function extractPlainText(
  richText: Array<{ plain_text: string }> | undefined
): string {
  if (!richText) return "";
  return richText.map((t) => t.plain_text).join("");
}
