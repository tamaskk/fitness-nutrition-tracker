import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <UserPreferencesProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </UserPreferencesProvider>
    </SessionProvider>
  );
}
