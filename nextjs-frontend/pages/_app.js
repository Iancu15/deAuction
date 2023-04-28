import '../styles/globals.css'
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import Header from "../components/header/Header"
import Head from "next/head"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Auction</title>
        <meta name="description" content="Auction app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <Header />
            <Component {...pageProps} />
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  )
}
