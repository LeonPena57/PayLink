import type { Metadata } from "next";
import { Manrope, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { Navigation } from "@/components/layout/Navigation";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Paylink",
  description: "Freelancer commission platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${robotoCondensed.variable} antialiased font-sans min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <ToastProvider>
              <Navigation />
              {children}
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
