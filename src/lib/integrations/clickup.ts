const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";
const CLICKUP_AUTH_URL = "https://app.clickup.com/api";

interface ClickUpTokenResponse {
  access_token: string;
  token_type: string;
}

interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

interface ClickUpWorkspace {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: {
    status: string;
    color: string;
  };
  priority?: {
    id: string;
    priority: string;
    color: string;
  };
  due_date?: string;
  date_created: string;
  date_updated: string;
  creator: {
    id: number;
    username: string;
    email: string;
  };
}

export function getClickUpAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.CLICKUP_CLIENT_ID;
  if (!clientId) throw new Error("CLICKUP_CLIENT_ID not configured");

  return `${CLICKUP_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
}

export async function exchangeClickUpCode(
  code: string,
  redirectUri: string
): Promise<ClickUpTokenResponse> {
  const clientId = process.env.CLICKUP_CLIENT_ID;
  const clientSecret = process.env.CLICKUP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ClickUp credentials not configured");
  }

  const response = await fetch(`${CLICKUP_AUTH_URL}/v2/oauth/token`, {
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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickUp token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getClickUpUser(
  accessToken: string
): Promise<ClickUpUser> {
  const response = await fetch(`${CLICKUP_API_BASE}/user`, {
    headers: {
      Authorization: accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ClickUp user");
  }

  const data = await response.json();
  return data.user;
}

export async function getClickUpWorkspaces(
  accessToken: string
): Promise<ClickUpWorkspace[]> {
  const response = await fetch(`${CLICKUP_API_BASE}/team`, {
    headers: {
      Authorization: accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ClickUp workspaces");
  }

  const data = await response.json();
  return data.teams;
}

export async function getClickUpTasks(
  accessToken: string,
  listId: string
): Promise<ClickUpTask[]> {
  const response = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
    headers: {
      Authorization: accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ClickUp tasks");
  }

  const data = await response.json();
  return data.tasks;
}

export async function createClickUpTask(
  accessToken: string,
  listId: string,
  task: {
    name: string;
    description?: string;
    priority?: number;
    due_date?: number;
  }
): Promise<ClickUpTask> {
  const response = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ClickUp task: ${error}`);
  }

  return response.json();
}

export async function updateClickUpTask(
  accessToken: string,
  taskId: string,
  updates: {
    name?: string;
    description?: string;
    status?: string;
    priority?: number;
    due_date?: number;
  }
): Promise<ClickUpTask> {
  const response = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update ClickUp task: ${error}`);
  }

  return response.json();
}
