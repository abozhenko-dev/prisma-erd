import type { AppProps as NextAppProps } from "next/app";

import { PrismaProvider } from "@contexts";
import { NextPageWithLayout } from "@declarations";
import { SWRConfig } from "swr";

import "@scss/globals.scss";

interface AppProps extends NextAppProps {
  Component: NextPageWithLayout;
}

const App = ({ Component, pageProps }: AppProps) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SWRConfig
      value={{
        fetcher: (input: RequestInfo | URL, init?: RequestInit | undefined) => fetch(input, init).then((res) => res.json()),
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
      }}
    >
      <PrismaProvider>{getLayout(<Component {...pageProps} />)}</PrismaProvider>
    </SWRConfig>
  );
};

export default App;
