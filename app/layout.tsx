import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIMA Vendor Registration Portal",
  description: "All India Management Association — Official Vendor Registration Portal. Register your business securely with GST & PAN document verification.",
  keywords: "AIMA, vendor registration, GST, PAN, vendor portal, All India Management Association",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="https://www.aima.in/img/favicon-logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
