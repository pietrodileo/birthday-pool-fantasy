import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Il Gran Ballo del Bosco",
  description: "Una piccola arena di voto per eleggere il costume più glorioso del bosco."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
