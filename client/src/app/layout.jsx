import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ClientLayout from '@/components/layout/ClientLayout';

export const metadata = {
  title: 'Flipkart Clone - Online Shopping India',
  description: 'India\'s biggest online store. Free Shipping & COD available. Shop for electronics, clothing, home & more at best prices.',
  keywords: 'online shopping, flipkart, electronics, fashion, home, appliances',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Roboto', sans-serif" }}>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '4px',
                },
                success: {
                  iconTheme: { primary: '#4caf50', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ff5252', secondary: '#fff' },
                },
              }}
            />
            <ClientLayout>{children}</ClientLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
