import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { Suspense } from "react";
import Loading from "./loading";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import NextTopLoader from 'nextjs-toploader';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Elevation Game",
  description: "Elevation Game",
};

export default function RootLayout({ children }) {
 
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <Suspense fallback={<Loading />}>
          <Providers>
          <NextTopLoader />
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
