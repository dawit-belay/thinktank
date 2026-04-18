import Navbar from "@/components/Navbar";
import SupabaseProvider from "@/components/SupabaseProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 min-h-screen">
        <SupabaseProvider>
          <Navbar />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}