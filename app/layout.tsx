import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Counted",
  description: "Turn your MoMo statements into clear spending patterns and better financial decisions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
