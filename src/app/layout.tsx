import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
  axes: ["GRAD", "opsz", "wdth", "YTLC", "YTUC", "YTFI", "YTAS", "YTDE"],
});

export const metadata: Metadata = {
  title: "ecoOmetepe - Guardianes de Altagracia",
  description:
    "App ecológica para cuidar la Isla de Ometepe: reporta problemas ambientales, descubre lugares y aprende con los guardianes de Altagracia.",
  keywords: [
    "Ometepe",
    "Altagracia",
    "ecología",
    "medio ambiente",
    "Nicaragua",
    "reciclaje",
    "conservación",
  ],
  authors: [{ name: "ecoOmetepe" }],
  icons: {
    icon: "/icon_128x128.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6fbf3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1410" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Material Symbols Rounded (Flutter-style icon font) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Apply stored theme before hydration to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('eco-theme')||'';if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoFlex.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
