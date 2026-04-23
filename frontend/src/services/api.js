import axios from 'axios';

const getDefaultServiceUrl = (servicePath, localPort) => {
  if (typeof window === 'undefined') {
    return `http://localhost:${localPort}${servicePath}`;
  }

  const { hostname, port, origin } = window.location;

  // CRA dev server usually runs on port 3000. In that case, hit the local
  // backend services directly so login works even when the nginx gateway is off.
  if (hostname === 'localhost' && port === '3000') {
    return `http://localhost:${localPort}${servicePath}`;
  }

  return `${origin}${servicePath}`;
};

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

const userClient = createServiceClient(
  process.env.REACT_APP_USER_SERVICE_URL || getDefaultServiceUrl('/api/auth', 8001)
);
const restaurantClient = createServiceClient(
  process.env.REACT_APP_RESTAURANT_SERVICE_URL || getDefaultServiceUrl('/api/restaurant', 8002)
);
const orderClient = createServiceClient(
  process.env.REACT_APP_ORDER_SERVICE_URL || getDefaultServiceUrl('/api/orders', 8003)
);

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
