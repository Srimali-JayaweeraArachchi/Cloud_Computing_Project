import axios from 'axios';

const createServiceClient = (baseURL) => {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const userClient = createServiceClient(process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8001');
const restaurantClient = createServiceClient(process.env.REACT_APP_RESTAURANT_SERVICE_URL || 'http://localhost:8002');
const orderClient = createServiceClient(process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:8003');

export const authAPI = {
  register: (userData) => userClient.post('/api/auth/register', userData),
  login: (credentials) => userClient.post('/api/auth/login', credentials),
  validate: () => userClient.get('/api/auth/validate'),
  getUsers: () => userClient.get('/api/auth/admin/users'),
  updateUserRole: (userId, role) => userClient.put(`/api/auth/admin/users/${userId}/role`, { role }),
};

export const restaurantAPI = {
  getRestaurants: () => restaurantClient.get('/api/restaurant/restaurants'),
  getAllRestaurants: () => restaurantClient.get('/api/restaurant/admin/restaurants'),
  getRestaurant: (restaurantId) => restaurantClient.get(`/api/restaurant/${restaurantId}`),
  registerRestaurant: (data) => restaurantClient.post('/api/restaurant/register', data),
  getMenu: (restaurantId) => restaurantClient.get(`/api/restaurant/menu/${restaurantId}`),
  addMenuItem: (data) => restaurantClient.post('/api/restaurant/menu', data),
  updateApproval: (restaurantId, isApproved) =>
    restaurantClient.put(`/api/restaurant/admin/restaurants/${restaurantId}/approval`, { isApproved }),
};

export const orderAPI = {
  placeOrder: (orderData) => orderClient.post('/api/orders', orderData),
  getOrderHistory: () => orderClient.get('/api/orders/history'),
  getRestaurantOrders: (restaurantId) => orderClient.get(`/api/orders/restaurant/${restaurantId}`),
  getAllOrders: () => orderClient.get('/api/orders/admin/all'),
  getOrder: (orderId) => orderClient.get(`/api/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => orderClient.put(`/api/orders/${orderId}/status`, { status }),
};

const api = { authAPI, restaurantAPI, orderAPI };

export default api;
