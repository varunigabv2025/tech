import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'TrustFlow · Unit Dashboard',
  description: 'Person 2 — Job-work unit dashboard for orders, delivery, invoices, and TReDS discount readiness.'
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
