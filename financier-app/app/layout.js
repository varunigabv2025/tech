import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'TrustFlow · Financier desk',
  description: 'Person 3 — TReDS packaging, financier underwriting, and Account Aggregator consent'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
