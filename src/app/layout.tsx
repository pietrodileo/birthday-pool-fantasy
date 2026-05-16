import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birthday Fantasy Pool",
  description: "A tiny costume voting app for a medieval fantasy birthday party."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
