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
  title: "Paylink | The Best Commission Site for Freelancers & Artists",
  description: "The ultimate alternative to Fiverr, Ko-fi, and Upwork. Secure payments, file delivery, and instant payouts for digital artists and freelancers. Better than PayPal for commissions.",
  keywords: ["commission site", "freelance platform", "digital art commissions", "Fiverr alternative", "Ko-fi alternative", "Upwork alternative", "PayPal for freelancers", "secure file delivery", "artist payments", "freelance invoicing"],
  openGraph: {
    title: "Paylink | The Best Commission Site for Freelancers & Artists",
    description: "Secure payments, file delivery, and instant payouts. The all-in-one platform for modern creators.",
    type: "website",
    siteName: "Paylink",
  },
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
