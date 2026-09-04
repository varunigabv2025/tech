'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import UnitSelector from '@/components/UnitSelector';
import { OrdersIcon, PlusIcon, CheckCircleIcon, InvoicesIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Unit context
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    unitId: '',
    buyerName: '',
    description: '',
    amount: '',
    orderDate: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  // Per-row loading states
  const [actionLoading, setActionLoading] = useState({}); // { [orderId]: 'delivering' | 'invoicing' }
  const [rowMessages, setRowMessages] = useState({}); // { [orderId]: { type: 'success'|'error', text: string, invoiceId?: string } }

  // Load orders from backend
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const res = await api.getOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        setOrdersError('Failed to parse orders data');
      }
    } catch (err) {
      setOrdersError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sync unitId into form when selected unit changes
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    setFormData((prev) => ({ ...prev, unitId: unit.id }));
    if (formErrors.unitId) {
      setFormErrors((prev) => ({ ...prev, unitId: null }));
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.unitId || formData.unitId.trim() === '') {
      errors.unitId = 'Please select an active MSME unit';
    }
    if (!formData.buyerName || formData.buyerName.trim() === '') {
      errors.buyerName = 'Buyer Enterprise Name is required';
    }
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Order description is required';
    }
    const numericAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = 'Amount must be a number greater than 0';
    }
    if (!formData.orderDate || formData.orderDate.trim() === '') {
      errors.orderDate = 'Order Placement Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!validateForm()) return;

    setSubmittingOrder(true);
    try {
      const payload = {
        unitId: formData.unitId.trim(),
        buyerName: formData.buyerName.trim(),
        description: formData.description.trim(),
        amount: Number(formData.amount),
        orderDate: formData.orderDate.trim()
      };

      const res = await api.createOrder(payload);

      if (res.success && res.order) {
        setFormFeedback({
          type: 'success',
          message: `Order ${res.order.id} created successfully!`
        });
        // Reset form keeping unitId & date
        setFormData((prev) => ({
          ...prev,
          buyerName: '',
          description: '',
          amount: ''
        }));
        // Refresh orders list
        await fetchOrders();
      }
    } catch (err) {
      setFormFeedback({
        type: 'error',
        message: err.message || 'Failed to create order. Please check inputs.'
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Action: Mark Delivered
  const handleMarkDelivered = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'delivering' }));
    setRowMessages((prev) => ({ ...prev, [orderId]: null }));

    try {
      const res = await api.deliverOrder(orderId);
      if (res.success && res.order) {
        setRowMessages((prev) => ({
          ...prev,
          [orderId]: { type: 'success', text: 'Delivered!' }
        }));
        await fetchOrders();
      }
    } catch (err) {
      setRowMessages((prev) => ({
        ...prev,
        [orderId]: { type: 'error', text: err.message || 'Delivery update failed' }
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // Action: Generate Invoice
  const handleGenerateInvoice = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'invoicing' }));
    setRowMessages((prev) => ({ ...prev, [orderId]: null }));

    try {
      const res = await api.createInvoice(orderId);
      if (res.success && res.invoice) {
        setRowMessages((prev) => ({
          ...prev,
          [orderId]: {
            type: 'success',
            text: `Invoice created: ${res.invoice.id}`,
            invoiceId: res.invoice.id
          }
        }));
        await fetchOrders();
      }
    } catch (err) {
      setRowMessages((prev) => ({
        ...prev,
        [orderId]: { type: 'error', text: err.message || 'Invoice generation failed' }
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Job-Work Purchase Orders"
        description="Register new supply orders and mark delivery completion to generate receivable invoices."
        badge="ORDERS"
        actions={
          <UnitSelector
            selectedUnitId={selectedUnit ? selectedUnit.id : ''}
            onSelectUnit={handleSelectUnit}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Order Form */}
        <div className="lg:col-span-1">
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusIcon className="w-5 h-5 text-[#74512D]" />
                  <h2 className="text-sm font-bold text-[#543310]">Create Purchase Order</h2>
                </div>
                {selectedUnit && (
                  <span className="font-mono text-xs text-[#74512D] bg-[#EFE7CB] px-2 py-0.5 rounded font-semibold">
                    {selectedUnit.id}
                  </span>
                )}
              </div>
            }
          >
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {formFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    formFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {formFeedback.message}
                </div>
              )}

              <FormField
                label="Buyer Enterprise Name"
                id="buyerName"
                placeholder="e.g. ABC Exports"
                value={formData.buyerName}
                onChange={handleChange('buyerName')}
                error={formErrors.buyerName}
                required
                hint="Enterprise receiving manufacturing services"
              />

              <FormField
                label="Order Description"
                id="description"
                type="textarea"
                placeholder="e.g. 5,000 knitted cotton T-shirts"
                value={formData.description}
                onChange={handleChange('description')}
                error={formErrors.description}
                required
                hint="Goods or job-work specification"
              />

              <FormField
                label="Order Amount (₹ INR)"
                id="amount"
                type="number"
                placeholder="e.g. 482500"
                value={formData.amount}
                onChange={handleChange('amount')}
                error={formErrors.amount}
                required
                hint="Total supply order value"
              />

              <FormField
                label="Order Placement Date"
                id="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleChange('orderDate')}
                error={formErrors.orderDate}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={submittingOrder}
                >
                  {submittingOrder ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Creating Order...</span>
                    </span>
                  ) : (
                    <span>Create Order</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#543310]">Live Orders</h2>
            <span className="text-xs text-[#AF8F6F] font-mono">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Found
            </span>
          </div>

          {loadingOrders ? (
            <Card>
              <LoadingState message="Fetching live orders from backend..." />
            </Card>
          ) : ordersError ? (
            <Card>
              <ErrorState message={ordersError} onRetry={fetchOrders} />
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <EmptyState
                title="No orders registered yet"
                description="Create your first job-work order using the form on the left to begin the TrustFlow workflow."
                icon={<OrdersIcon className="w-6 h-6 text-[#74512D]" />}
              />
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2D4C3] bg-[#FAF6E9] text-[#74512D] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Buyer</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Delivery Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D4C3]">
                    {orders.map((order) => {
                      const isDelivered = order.deliveryStatus === 'DELIVERED';
                      const isLoadingRow = actionLoading[order.id];
                      const rowMsg = rowMessages[order.id];

                      return (
                        <tr key={order.id} className="hover:bg-[#FAF6E9]/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#543310]">
                            {order.id}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#543310]">
                            {order.buyerName}
                          </td>
                          <td className="py-3.5 px-4 text-[#74512D] max-w-[180px] truncate" title={order.description}>
                            {order.description}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#543310]">
                            {formatINR(order.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-[#74512D]">
                            {formatDate(order.orderDate)}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={order.deliveryStatus} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              {!isDelivered ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={Boolean(isLoadingRow)}
                                  onClick={() => handleMarkDelivered(order.id)}
                                >
                                  {isLoadingRow === 'delivering' ? (
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                      <span>Updating...</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <CheckCircleIcon className="w-3.5 h-3.5" />
                                      <span>Mark Delivered</span>
                                    </span>
                                  )}
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-700" />
                                    Delivered
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={Boolean(isLoadingRow)}
                                    onClick={() => handleGenerateInvoice(order.id)}
                                  >
                                    {isLoadingRow === 'invoicing' ? (
                                      <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 border-2 border-[#74512D]/40 border-t-[#74512D] rounded-full animate-spin" />
                                        <span>Generating...</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <InvoicesIcon className="w-3.5 h-3.5 text-[#74512D]" />
                                        <span>Generate Invoice</span>
                                      </span>
                                    )}
                                  </Button>
                                </div>
                              )}

                              {rowMsg && (
                                <span
                                  className={`text-[11px] font-medium ${
                                    rowMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                                  }`}
                                >
                                  {rowMsg.text}{' '}
                                  {rowMsg.invoiceId && (
                                    <Link
                                      href={`/invoices/${rowMsg.invoiceId}`}
                                      className="underline font-semibold"
                                    >
                                      View Invoice &rarr;
                                    </Link>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
