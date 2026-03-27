import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signly — American Sign Language to Speech",
  description:
    "Real-time ASL to Speech AI system. Translate American Sign Language to text and speech using computer vision and deep learning — entirely in your browser.",
  keywords: ["ASL", "sign language", "speech", "AI", "accessibility", "MediaPipe", "TensorFlow"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
