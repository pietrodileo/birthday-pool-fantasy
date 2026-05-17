import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concilio dei Costumi",
  description: "Una piccola arena di voto per eleggere il costume più glorioso del reame."
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
