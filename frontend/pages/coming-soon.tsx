import Head from "next/head"

export default function ComingSoon() {
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-[url(/noise.svg)]">
          <title>Coming Soon</title>
          <link rel="icon" href="/favicon.ico" />
  
        <main className="text-center">
          <h1 className="text-6xl font-bold mb-4">
            Coming Soon
          </h1>
          <p className="text-xl mb-8">
            As we speak a single monkey is typing on a keyboard. Stay tuned!
          </p>
        </main>
      </div>)
}