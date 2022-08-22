import type { AppProps } from "next/app";

import Home from "./Home/Home";
import "../styles/globals.css";
import "./App.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Home {...pageProps} />;
}

export default MyApp;
