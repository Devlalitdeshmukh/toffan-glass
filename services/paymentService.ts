const API_BASE_URL = 'http://localhost:5000/api';

class PaymentService {
    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all payments with stats (Admin/Staff only)
    static async getAllPayments() {
        try {
            const response = await fetch(`${API_BASE_URL}/payments`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get payments');
            }

            return {
                success: true,
                payments: data.payments,
                stats: data.stats
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get payment by ID (Admin/Staff only)
    static async getPaymentById(id: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get payment');
            }

            return {
                success: true,
                payment: data.payment
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get customers for payment form (Admin/Staff only)
    static async getPaymentCustomers() {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/customers`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get payment customers');
            }

            return {
                success: true,
                customers: data.customers
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get payments by site ID (Admin/Staff only)
    static async getPaymentsBySiteId(siteId: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/site/${siteId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get payments');
            }

            return {
                success: true,
                payments: data.payments,
                totals: data.totals
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get customer sites (Admin/Staff only)
    static async getCustomerSites(customerId: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/customer/${customerId}/sites`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get customer sites');
            }

            return {
                success: true,
                sites: data.sites
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get customer payments (Admin/Staff only)
    static async getCustomerPayments(customerId: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/customer/${customerId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get customer payments');
            }

            return {
                success: true,
                payments: data.payments
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new payment (Admin/Staff only)
    static async createPayment(paymentData: {
        siteId: string | number;
        customerId: string | number;
        productName: string;
        amount: number;
        paidAmount?: number;
        paymentDate?: string;
        status?: string;
        paymentMethod?: string;
        transactionId?: string;
        notes?: string;
        paymentReceipt?: File | null;
        existingReceiptUrl?: string;
    }) {
        try {
            let response;
            if (paymentData.paymentReceipt instanceof File) {
                const formData = new FormData();
                Object.entries(paymentData).forEach(([key, value]) => {
                    if (key === 'paymentReceipt') return;
                    if (value !== undefined && value !== null) formData.append(key, String(value));
                });
                formData.append('paymentReceipt', paymentData.paymentReceipt);

                response = await fetch(`${API_BASE_URL}/payments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.getAuthHeaders()['Authorization']
                    },
                    body: formData
                });
            } else {
                response = await fetch(`${API_BASE_URL}/payments`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(paymentData)
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            return {
                success: true,
                payment: data.payment
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update payment (Admin/Staff only)
    static async updatePayment(id: string | number, paymentData: any) {
        try {
            let response;
            if (paymentData.paymentReceipt instanceof File) {
                const formData = new FormData();
                Object.entries(paymentData).forEach(([key, value]) => {
                    if (key === 'paymentReceipt') return;
                    if (value !== undefined && value !== null) formData.append(key, String(value));
                });
                formData.append('paymentReceipt', paymentData.paymentReceipt);

                response = await fetch(`${API_BASE_URL}/payments/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': this.getAuthHeaders()['Authorization']
                    },
                    body: formData
                });
            } else {
                response = await fetch(`${API_BASE_URL}/payments/${id}`, {
                    method: 'PUT',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(paymentData)
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update payment');
            }

            return {
                success: true,
                payment: data.payment
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get customer product/service options (Admin/Staff only)
    static async getCustomerProducts(customerId: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/customer/${customerId}/products`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get customer products');
            }

            return {
                success: true,
                products: data.products
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update payment status (Admin/Staff only)
    static async updatePaymentStatus(id: string | number, status: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${id}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update payment status');
            }

            return {
                success: true,
                payment: data.payment
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete payment (Admin only)
    static async deletePayment(id: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete payment');
            }

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get payments by status (Admin/Staff only)
    static async getPaymentsByStatus(status: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/status/${status}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get payments');
            }

            return {
                success: true,
                payments: data.payments
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get payment stats (Admin/Staff only)
    static async getPaymentStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/payments-stats`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get payment stats');
            }

            return {
                success: true,
                stats: data.stats
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate bill (Admin/Staff only)
    static async generateBill(id: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${id}/bill`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate bill');
            }

            return {
                success: true,
                bill: data.bill
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Download bill as PDF (Admin/Staff only)
    static async downloadBillPdf(id: string | number) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${id}/bill/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeaders()['Authorization']
                }
            });

            if (!response.ok) {
                let errorMessage = 'Failed to download bill PDF';
                try {
                    const data = await response.json();
                    errorMessage = data.error || errorMessage;
                } catch (_) {
                    // ignore json parse error for binary response
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const disposition = response.headers.get('content-disposition') || '';
            const fileNameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
            link.download = fileNameMatch?.[1] || `bill-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper function to calculate payment status
    static calculateStatus(totalAmount: number, paidAmount: number): string {
        const paid = parseFloat(paidAmount.toString()) || 0;
        const total = parseFloat(totalAmount.toString()) || 0;
        
        if (paid >= total) return 'PAID';
        if (paid > 0) return 'PARTIALLY_PAID';
        return 'UNPAID';
    }

    // Helper function to calculate balance
    static calculateBalance(totalAmount: number, paidAmount: number): number {
        const total = parseFloat(totalAmount.toString()) || 0;
        const paid = parseFloat(paidAmount.toString()) || 0;
        return Math.max(0, total - paid);
    }
}

export default PaymentService;
