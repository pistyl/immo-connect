import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: "ImmoConnect Dakar - Application de Gestion Locative Digitale au Sénégal",
  description: "Plateforme mobile-first de mise en relation et de gestion locative à Dakar : annonces, messagerie, bail digital conforme, état des lieux et paiement de loyer via Wave et Orange Money.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ImmoConnect Dakar",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen pb-20 selection:bg-emerald-500 selection:text-slate-950">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
