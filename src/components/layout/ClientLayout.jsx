'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // The homepage ("/") has its own custom header, so we don't show the standard Navbar
  if (pathname === '/') {
    return (
      <>
        {children}
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
