import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Circula — Decentralized Study Material Circulation",
  description: "Share, discover, and earn from high-quality study materials. Upload notes, earn CircuBits, and access premium content on the world's first decentralized study resource platform.",
  keywords: "study materials, notes sharing, education, CircuBits, premium content, bounties",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
