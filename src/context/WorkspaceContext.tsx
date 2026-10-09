import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  listWorkspaceFiles,
  createPanchayatDoc,
  createPanchayatSheet,
  createPanchayatPresentation,
  WorkspaceFile,
  SlideSlideData
} from '../services/googleWorkspace.ts';

interface WorkspaceContextType {
  user: User | null;
  token: string | null;
  isSignedIn: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutFromGoogle: () => Promise<void>;
  files: WorkspaceFile[];
  isLoadingFiles: boolean;
  refreshFiles: (mimeType?: string) => Promise<void>;
  createDoc: (title: string, content: string) => Promise<{ id: string; webViewLink: string; name: string }>;
  createSheet: (title: string, headers: string[], rows: (string | number)[][]) => Promise<{ id: string; webViewLink: string; name: string }>;
  createPresentation: (title: string, slides: SlideSlideData[]) => Promise<{ id: string; webViewLink: string; name: string }>;
  error: string | null;
  clearError: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const signInWithGoogleHandler = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        // Automatically fetch recent workspace files
        loadFiles();
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err?.message || 'Google साइन-इन विफल हुआ');
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOutFromGoogleHandler = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      setFiles([]);
    } catch (err: any) {
      console.error('Google sign out error:', err);
    }
  };

  const loadFiles = async (mimeType?: string) => {
    if (!token) return;
    setIsLoadingFiles(true);
    try {
      const list = await listWorkspaceFiles(mimeType);
      setFiles(list);
    } catch (err: any) {
      console.warn('Error fetching workspace files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateDoc = async (title: string, content: string) => {
    setError(null);
    try {
      const doc = await createPanchayatDoc(title, content);
      await loadFiles();
      return doc;
    } catch (err: any) {
      setError(err?.message || 'Google Doc बनाने में त्रुटि');
      throw err;
    }
  };

  const handleCreateSheet = async (title: string, headers: string[], rows: (string | number)[][]) => {
    setError(null);
    try {
      const sheet = await createPanchayatSheet(title, headers, rows);
      await loadFiles();
      return sheet;
    } catch (err: any) {
      setError(err?.message || 'Google Sheet बनाने में त्रुटि');
      throw err;
    }
  };

  const handleCreatePresentation = async (title: string, slides: SlideSlideData[]) => {
    setError(null);
    try {
      const pres = await createPanchayatPresentation(title, slides);
      await loadFiles();
      return pres;
    } catch (err: any) {
      setError(err?.message || 'Google Slides बनाने में त्रुटि');
      throw err;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        token,
        isSignedIn: Boolean(user && token),
        isSigningIn,
        signInWithGoogle: signInWithGoogleHandler,
        signOutFromGoogle: signOutFromGoogleHandler,
        files,
        isLoadingFiles,
        refreshFiles: loadFiles,
        createDoc: handleCreateDoc,
        createSheet: handleCreateSheet,
        createPresentation: handleCreatePresentation,
        error,
        clearError: () => setError(null)
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
