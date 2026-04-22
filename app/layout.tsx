import "./globals.css";

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="select-none antialiased">{children}</body>
    </html>)}
