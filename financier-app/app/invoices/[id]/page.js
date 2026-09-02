import InvoiceDetail from '@/components/InvoiceDetail';

export default function InvoicePage({ params }) {
  return <InvoiceDetail invoiceId={params.id} />;
}
