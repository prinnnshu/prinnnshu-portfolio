import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xbox Wireless Controller | Cinematic Launch",
  description: "Hyper-premium scroll-driven controller product story.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
