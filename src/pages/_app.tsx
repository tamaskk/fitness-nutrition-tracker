import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <UserPreferencesProvider>
        <NotificationProvider>
          <Component {...pageProps} />
          <Toaster position="top-right" />
        </NotificationProvider>
      </UserPreferencesProvider>
    </SessionProvider>
  );
}
