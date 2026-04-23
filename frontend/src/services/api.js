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

const userClient = createServiceClient(process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost/api/auth');
const restaurantClient = createServiceClient(process.env.REACT_APP_RESTAURANT_SERVICE_URL || 'http://localhost/api/restaurant');
const orderClient = createServiceClient(process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost/api/orders');

export const authAPI = {
  register: (userData) => userClient.post('/register', userData),
  login: (credentials) => userClient.post('/login', credentials),
  validate: () => userClient.get('/validate'),
  getUsers: () => userClient.get('/admin/users'),
  updateUserRole: (userId, role) => userClient.put(`/admin/users/${userId}/role`, { role }),
};

export const restaurantAPI = {
  getRestaurants: () => restaurantClient.get('/restaurants'),
  getAllRestaurants: () => restaurantClient.get('/admin/restaurants'),
  getRestaurant: (restaurantId) => restaurantClient.get(`/${restaurantId}`),
  registerRestaurant: (data) => restaurantClient.post('/register', data),
  getMenu: (restaurantId) => restaurantClient.get(`/menu/${restaurantId}`),
  addMenuItem: (data) => restaurantClient.post('/menu', data),
  updateApproval: (restaurantId, isApproved) =>
    restaurantClient.put(`/admin/restaurants/${restaurantId}/approval`, { isApproved }),
};

export const orderAPI = {
  placeOrder: (orderData) => orderClient.post('/', orderData),
  getOrderHistory: () => orderClient.get('/history'),
  getRestaurantOrders: (restaurantId) => orderClient.get(`/restaurant/${restaurantId}`),
  getAllOrders: () => orderClient.get('/admin/all'),
  getOrder: (orderId) => orderClient.get(`/${orderId}`),
  updateOrderStatus: (orderId, status) => orderClient.put(`/${orderId}/status`, { status }),
};

const api = { authAPI, restaurantAPI, orderAPI };

export default api;
