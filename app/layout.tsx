import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { FormProvider } from "@/lib/state/FormContext";
import { ScreenTransition } from "@/components/motion/ScreenTransition";

const ppEditorial = localFont({
  src: [
    { path: '../public/fonts/PPEditorialNew-Ultralight.otf', weight: '200', style: 'normal' },
    { path: '../public/fonts/PPEditorialNew-UltralightItalic.otf', weight: '200', style: 'italic' },
    { path: '../public/fonts/PPEditorialNew-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/PPEditorialNew-Ultrabold.otf', weight: '800', style: 'normal' },
    { path: '../public/fonts/PPEditorialNew-UltraboldItalic.otf', weight: '800', style: 'italic' }
  ],
  variable: '--font-pp-editorial',
  display: 'swap'
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Gringa Discovery Form",
  description: "A multi-step branding discovery form for Gringa Group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ppEditorial.variable}`}>
      <body>
        <FormProvider>
          <ScreenTransition>{children}</ScreenTransition>
        </FormProvider>
      </body>
    </html>
  );
}
