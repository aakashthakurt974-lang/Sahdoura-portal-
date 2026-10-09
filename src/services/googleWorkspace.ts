import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/presentations'
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Workspace File item interface
export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

// ---------------- Google Drive Helpers ---------------- //
export const listWorkspaceFiles = async (
  mimeType?: string
): Promise<WorkspaceFile[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  let query = "trashed = false";
  if (mimeType) {
    query += ` and mimeType = '${mimeType}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=20`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch files from Google Drive');
  }

  const data = await res.json();
  return data.files || [];
};

// ---------------- Google Docs Integration ---------------- //
export const createPanchayatDoc = async (
  title: string,
  content: string
): Promise<{ id: string; webViewLink: string; name: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  // Step 1: Create an empty Google Doc via Drive API
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: title,
      mimeType: 'application/vnd.google-apps.document'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Google Doc');
  }

  const newDoc = await createRes.json();
  const documentId = newDoc.id;

  // Step 2: Populate document content with Google Docs API batchUpdate
  if (content && content.trim().length > 0) {
    const updateRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content
              }
            }
          ]
        })
      }
    );

    if (!updateRes.ok) {
      console.warn('Doc content insertion notice:', await updateRes.text());
    }
  }

  return {
    id: documentId,
    webViewLink: `https://docs.google.com/document/d/${documentId}/edit`,
    name: title
  };
};

// ---------------- Google Sheets Integration ---------------- //
export const createPanchayatSheet = async (
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<{ id: string; webViewLink: string; name: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  // Step 1: Create new spreadsheet via Sheets API
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: 'डाटा रिकॉर्ड (Data)',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Google Sheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Step 2: Append header and data rows
  const allValues = [headers, ...rows];
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'डाटा रिकॉर्ड (Data)'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: allValues
      })
    }
  );

  if (!appendRes.ok) {
    console.warn('Sheet append values warning:', await appendRes.text());
  }

  return {
    id: spreadsheetId,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    name: title
  };
};

// ---------------- Google Slides Integration ---------------- //
export interface SlideSlideData {
  title: string;
  subtitle?: string;
  bulletPoints: string[];
}

export const createPanchayatPresentation = async (
  title: string,
  slides: SlideSlideData[]
): Promise<{ id: string; webViewLink: string; name: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  // Step 1: Create new presentation
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Google Slides presentation');
  }

  const pres = await createRes.json();
  const presentationId = pres.presentationId;

  // Step 2: Add slides to presentation
  const requests: any[] = [];
  slides.forEach((slide, idx) => {
    const pageId = `slide_page_${idx + 1}_${Date.now()}`;
    const titleBoxId = `title_box_${idx + 1}_${Date.now()}`;
    const bodyBoxId = `body_box_${idx + 1}_${Date.now()}`;

    // Create slide
    requests.push({
      createSlide: {
        objectId: pageId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    });

    // Create Title text box
    requests.push({
      createShape: {
        objectId: titleBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: pageId,
          size: {
            width: { magnitude: 650, unit: 'PT' },
            height: { magnitude: 60, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 35,
            translateY: 30,
            unit: 'PT'
          }
        }
      }
    });

    // Insert Title Text
    requests.push({
      insertText: {
        objectId: titleBoxId,
        text: slide.title
      }
    });

    // Create Body text box
    const fullBodyText = [
      slide.subtitle ? `${slide.subtitle}\n\n` : '',
      ...slide.bulletPoints.map((b) => `• ${b}`)
    ].join('\n');

    requests.push({
      createShape: {
        objectId: bodyBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: pageId,
          size: {
            width: { magnitude: 650, unit: 'PT' },
            height: { magnitude: 300, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 35,
            translateY: 100,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: bodyBoxId,
        text: fullBodyText
      }
    });
  });

  if (requests.length > 0) {
    const updateRes = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      }
    );

    if (!updateRes.ok) {
      console.warn('Slides update warning:', await updateRes.text());
    }
  }

  return {
    id: presentationId,
    webViewLink: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    name: title
  };
};

// Confirmation helper for destructive actions per MANDATORY requirement
export const confirmDestructiveAction = (message: string): boolean => {
  return window.confirm(message);
};
