import { Metadata } from 'next';

export function generateMetadata(path: string): Metadata {
  const baseTitle = "RedArena";
  const baseDescription = "...";
  const baseUrl = "http://localhost:3000";
  let url;

  const pathConfig = {
    share: {
      title: "Share",
      description: "Share...",
      url : `card/${path}.png`
    },
    leaderboard: {
      title: "Leaderboard",
      description: "Check out...",
      url : `card/${path}.png`
    }
  };

  const pathMetadata = pathConfig[path as keyof typeof pathConfig] || {
    title : "RedArena",
    description: "Check out...",
    url : `card/og.png`
  };

  return {
    metadataBase: new URL(baseUrl),
    title: pathMetadata.title || `${path.charAt(0).toUpperCase() + path.slice(1)} - ${baseTitle}`,
    description: pathMetadata.description || baseDescription,
    authors: { name: "..." },
    // icons: {
    //   icon: "/favicon-32x32.png",
    //   shortcut: "/favicon-16x16.png",
    //   apple: "/apple-touch-icon.png",
    //   other: {
    //     rel: "apple-touch-icon",
    //     url: "/apple-touch-icon.png",
    //   },
    // },
    openGraph: {
      type: "website",
      url: `${baseUrl}/${path}`,
      title: pathMetadata.title || `${path.charAt(0).toUpperCase() + path.slice(1)} - ${baseTitle}`,
      description: pathMetadata.description || baseDescription,
      images: [
        {
          url: pathMetadata.url,
          width: 1200,
          height: 630,
          alt: `${path} page`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pathMetadata.title || `${path.charAt(0).toUpperCase() + path.slice(1)} - ${baseTitle}`,
      description: pathMetadata.description || baseDescription,
      images: [
        {
          url: pathMetadata.url ,
          width: 1200,
          height: 630,
          alt: `${path} page`,
        },
      ],
    },
  };
}
