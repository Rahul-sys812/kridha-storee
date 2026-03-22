import "animate.css";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

export const metadata = {
  title: "Kridha Luxe | Luxury Silver Jewellery Boutique",
  description: "Exquisite silver jewellery for the modern woman. Pinterest inspired designs, anti-tarnish finish, and premium quality crafted with elegance.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-brand-cream selection:bg-brand-gold selection:text-white overflow-x-hidden">
        <SmoothScrollProvider>
          <ClientProviders>
            <div className="min-h-screen flex flex-col font-sans text-brand-charcoal overflow-x-hidden">
              <Header />
              <CartDrawer />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ClientProviders>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
