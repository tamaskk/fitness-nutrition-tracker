import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <UserPreferencesProvider>
          <NotificationProvider>
            <Component {...pageProps} />
            <Toaster position="top-right" />
          </NotificationProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
