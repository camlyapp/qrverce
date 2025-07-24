import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const APP_NAME = "CodeMint";
const APP_DESCRIPTION = "Your All-in-One QR Code and Barcode Solution. Create custom QR codes and professional barcodes for free. Advanced styling, AI designs, and high-quality downloads.";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - QR Code & Barcode Generator`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ["QR Code Generator", "Barcode Generator", "Free QR Code", "Custom QR Code", "AI QR Code", "CodeMint"],
  authors: [{ name: "Camly", url: "https://camly.in" }],
  creator: "Camly",
  publisher: "Camly",
  robots: "index, follow",
  metadataBase: new URL("https://your-domain.com"), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    url: "/",
    title: {
      default: `${APP_NAME} - QR Code & Barcode Generator`,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: "/og-image.png", // Replace with your actual OG image path
        width: 1200,
        height: 630,
        alt: "CodeMint - QR Code and Barcode Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: `${APP_NAME} - QR Code & Barcode Generator`,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    images: ["/og-image.png"], // Replace with your actual OG image path
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&family=Oswald&family=Raleway&family=Playfair+Display&family=Dancing+Script&family=Pacifico&family=Lobster&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
