import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/custom-style.css";
import Providers from "@/store/Providers";
import AuthCookieSync from "@/components/AuthCookieSync";
import { Toaster } from "react-hot-toast";
// Root layout keeps only global providers and styles. Shells are applied per route group.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alpacross App",
  description: "Modern cryptocurrency trading platform",
  icons: {
    icon: [
      { url: "/alpacros.png", type: "image/png", sizes: "32x32" },
      { url: "/alpacros.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/alpacros.png",
    apple: "/alpacros.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AuthCookieSync />
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
