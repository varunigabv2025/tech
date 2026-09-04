import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'TrustFlow · Financier Desk',
  description: 'TReDS receivables underwriting, explainable TrustScore evaluation, and Account Aggregator consent platform'
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
