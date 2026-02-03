import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { ThemeProvider } from "next-themes";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
        <ToastContainer />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
