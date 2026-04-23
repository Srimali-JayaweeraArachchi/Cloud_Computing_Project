import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI, orderAPI, restaurantAPI } from '../services/api';

const roleOptions = ['customer', 'restaurant_owner', 'admin'];

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      setError('');

      const [usersResponse, restaurantsResponse, ordersResponse] = await Promise.allSettled([
          authAPI.getUsers(),
          restaurantAPI.getAllRestaurants(),
          orderAPI.getAllOrders(),
      ]);

      if (usersResponse.status === 'fulfilled') {
        setUsers(usersResponse.value.data);
      }

      if (restaurantsResponse.status === 'fulfilled') {
        setRestaurants(restaurantsResponse.value.data);
      }

      if (ordersResponse.status === 'fulfilled') {
        setOrders(ordersResponse.value.data);
      }

      const failedSections = [
        usersResponse.status !== 'fulfilled' ? 'users' : null,
        restaurantsResponse.status !== 'fulfilled' ? 'restaurants' : null,
        ordersResponse.status !== 'fulfilled' ? 'orders' : null,
      ].filter(Boolean);

      if (failedSections.length === 3) {
        setError('Unable to load admin data right now. Check whether the user, restaurant, and order services are running on ports 8001, 8002, and 8003.');
      } else if (failedSections.length > 0) {
        setError(`Some admin data could not be loaded: ${failedSections.join(', ')}. You can still use the sections that loaded successfully.`);
      }

      setLoading(false);
    };

    loadAdminData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users.');
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAllRestaurants();
      setRestaurants(response.data);
    } catch (error) {
      setError('Failed to fetch restaurants.');
    }
  };

  const approveRestaurant = async (restaurantId, isApproved) => {
    setFeedback('');
    setError('');

    try {
      await restaurantAPI.updateApproval(restaurantId, isApproved);
      await fetchRestaurants();
      setFeedback(`Restaurant ${isApproved ? 'approved' : 'sent back to pending'}.`);
    } catch (error) {
      setError('Failed to update restaurant approval.');
    }
  };

  const updateUserRole = async (userId, role) => {
    setFeedback('');
    setError('');

    try {
      await authAPI.updateUserRole(userId, role);
      await fetchUsers();
      setFeedback('User role updated.');
    } catch (error) {
      setError('Failed to update user role.');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="section-eyebrow">Admin command center</div>
          <h1>Oversee users, restaurants, and system-wide orders.</h1>
          <p className="section-copy">These panels are wired to the admin routes in the user, restaurant, and order services.</p>
        </div>
        <div className="header-actions">
          <div className="user-pill">{user?.name || 'Admin'}</div>
          <button className="secondary-button" onClick={logout}>Logout</button>
        </div>
      </header>

      {error ? <div className="form-message error">{error}</div> : null}
      {feedback ? <div className="form-message success">{feedback}</div> : null}
      {loading ? <p className="muted">Loading admin panels...</p> : null}

      <section className="dashboard-grid admin-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Users</h2>
            <span>{users.length} records</span>
          </div>

          <div className="table-like-list">
            {users.map((entry) => (
              <div key={entry._id} className="table-row">
                <div>
                  <strong>{entry.name}</strong>
                  <span>{entry.email}</span>
                </div>
                <select
                  className="inline-select"
                  value={entry.role}
                  onChange={(event) => updateUserRole(entry._id, event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Restaurants</h2>
            <span>{restaurants.length} records</span>
          </div>

          <div className="card-list compact">
            {restaurants.map((restaurant) => (
              <article key={restaurant._id} className="order-card">
                <div className="order-card-header">
                  <strong>{restaurant.name}</strong>
                  <div className={`status-pill ${restaurant.isApproved ? 'status-confirmed' : 'status-pending'}`}>
                    {restaurant.isApproved ? 'Approved' : 'Pending'}
                  </div>
                </div>
                <p>{restaurant.location || 'No location provided'}</p>
                <p>Owner: {restaurant.ownerId?.name || 'Unknown owner'}</p>
                <div className="button-row">
                  <button
                    className="primary-button small"
                    onClick={() => approveRestaurant(restaurant._id, !restaurant.isApproved)}
                  >
                    {restaurant.isApproved ? 'Mark pending' : 'Approve'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>All orders</h2>
          <span>{orders.length} records</span>
        </div>

        <div className="table-like-list">
          {orders.map((order) => (
            <div key={order._id} className="table-row">
              <div>
                <strong>{order.restaurantId?.name || 'Restaurant'}</strong>
                <span>Customer ID: {order.customerId}</span>
              </div>
              <div className={`status-pill status-${order.status}`}>{order.status}</div>
              <strong>${Number(order.totalPrice || 0).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
