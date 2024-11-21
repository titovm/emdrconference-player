import Head from 'next/head'
import '@/styles/globals.css'
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
    const router = useRouter();

    // Check if the current route is `/embed`
    const isEmbedPage = router.pathname === '/embed';
    return (
        <>
          <Head>
            <title>EMDR Video Player</title>
          </Head>
          {!isEmbedPage ? (
                <div className="md:w-1/2 m-auto mt-8 w-auto">
                <Component {...pageProps} />
                </div>
            ) : (
                <div className="embed-container">
                <Component {...pageProps} />
                </div>
            )}
        </>
      )
  }