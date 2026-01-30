const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
}

interface DriveFileList {
  files: DriveFile[];
  nextPageToken?: string;
}

export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const scopes = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${AUTH_URL}?${params}`;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google credentials not configured");
  }

  const response = await fetch(TOKEN_URL, {
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
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return response.json();
}

export async function refreshGoogleToken(
  refreshToken: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google credentials not configured");
  }

  const response = await fetch(TOKEN_URL, {
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
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token refresh failed: ${error}`);
  }

  return response.json();
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google user");
  }

  return response.json();
}

export async function listDriveFiles(
  accessToken: string,
  options?: {
    pageSize?: number;
    pageToken?: string;
    q?: string;
    orderBy?: string;
    folderId?: string;
  }
): Promise<DriveFileList> {
  const params = new URLSearchParams({
    pageSize: String(options?.pageSize || 20),
    fields:
      "nextPageToken,files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,webContentLink,iconLink,thumbnailLink,parents,owners)",
    orderBy: options?.orderBy || "modifiedTime desc",
  });

  let query = options?.q || "";
  if (options?.folderId) {
    const folderQuery = `'${options.folderId}' in parents`;
    query = query ? `${query} and ${folderQuery}` : folderQuery;
  }

  if (query) params.set("q", query);
  if (options?.pageToken) params.set("pageToken", options.pageToken);

  const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list Drive files: ${error}`);
  }

  return response.json();
}

export async function getDriveFile(
  accessToken: string,
  fileId: string
): Promise<DriveFile> {
  const params = new URLSearchParams({
    fields:
      "id,name,mimeType,createdTime,modifiedTime,size,webViewLink,webContentLink,iconLink,thumbnailLink,parents,owners",
  });

  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Drive file");
  }

  return response.json();
}

export async function searchDriveFiles(
  accessToken: string,
  query: string,
  pageSize: number = 20
): Promise<DriveFileList> {
  const escapedQuery = query.replace(/'/g, "\\'");
  const q = `fullText contains '${escapedQuery}' or name contains '${escapedQuery}'`;

  return listDriveFiles(accessToken, { q, pageSize });
}

export async function getRecentDriveFiles(
  accessToken: string,
  pageSize: number = 20
): Promise<DriveFileList> {
  return listDriveFiles(accessToken, {
    pageSize,
    orderBy: "viewedByMeTime desc",
    q: "viewedByMeTime > '1970-01-01T00:00:00'",
  });
}

export function getMimeTypeIcon(mimeType: string): string {
  const iconMap: Record<string, string> = {
    "application/vnd.google-apps.document": "FileText",
    "application/vnd.google-apps.spreadsheet": "Table",
    "application/vnd.google-apps.presentation": "Presentation",
    "application/vnd.google-apps.folder": "Folder",
    "application/pdf": "FileText",
    "image/": "Image",
    "video/": "Video",
    "audio/": "Music",
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (mimeType.startsWith(key) || mimeType === key) {
      return icon;
    }
  }

  return "File";
}
