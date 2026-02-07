import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth
export const login = (email: string, password: string) =>
    api.post('/auth/login', { email, password });

export const getMe = () => api.get('/me');

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getTopProducts = () => api.get('/dashboard/top-products');
export const getSalesTrend = (days = 7) => api.get(`/dashboard/sales-trend?days=${days}`);
export const getPaymentMethods = () => api.get('/dashboard/payment-methods');
export const getLowStock = () => api.get('/dashboard/low-stock');
export const getExpiringProducts = () => api.get('/dashboard/expiring-products');

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id: number) => api.get(`/products/${id}`);
export const createProduct = (data: any) => api.post('/products', data);
export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data: any) => api.post('/categories', data);
export const updateCategory = (id: number, data: any) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

// Materials
export const getMaterials = () => api.get('/materials');
export const createMaterial = (data: any) => api.post('/materials', data);
export const updateMaterial = (id: number, data: any) => api.put(`/materials/${id}`, data);
export const deleteMaterial = (id: number) => api.delete(`/materials/${id}`);

// Labors
export const getLabors = () => api.get('/labors');
export const createLabor = (data: any) => api.post('/labors', data);
export const updateLabor = (id: number, data: any) => api.put(`/labors/${id}`, data);
export const deleteLabor = (id: number) => api.delete(`/labors/${id}`);

// Overheads
export const getOverheads = () => api.get('/overheads');
export const createOverhead = (data: any) => api.post('/overheads', data);
export const updateOverhead = (id: number, data: any) => api.put(`/overheads/${id}`, data);
export const deleteOverhead = (id: number) => api.delete(`/overheads/${id}`);

// Customers
export const getCustomers = () => api.get('/customers');
export const getCustomer = (id: number) => api.get(`/customers/${id}`);
export const createCustomer = (data: any) => api.post('/customers', data);
export const updateCustomer = (id: number, data: any) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data: any) => api.post('/expenses', data);
export const updateExpense = (id: number, data: any) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id: number) => api.delete(`/expenses/${id}`);

// Transactions
export const getTransactions = () => api.get('/transactions');
export const getTransaction = (id: number) => api.get(`/transactions/${id}`);
export const deleteTransaction = (id: number) => api.delete(`/transactions/${id}`);

// POS
export const checkout = (data: any) => api.post('/pos/checkout', data);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data: any) => api.put('/settings', data);

// Upload
export const uploadImage = (file: File, folder: string = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/upload/image?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
