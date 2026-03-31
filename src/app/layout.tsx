import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 min-h-screen">
        {/* Navbar is outside of {children} so it never disappears */}
        <Navbar />
        
        {/* This is where Home, Login, or MeetingRoom will render */}
        {children}
      </body>
    </html>
  );
}