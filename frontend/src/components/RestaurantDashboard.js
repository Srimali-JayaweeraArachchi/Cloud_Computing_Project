import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { restaurantAPI, orderAPI } from '../services/api';

const nextStatusMap = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

const RestaurantDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getRestaurants();
      const userRestaurant = response.data.find((entry) => {
        const ownerId = typeof entry.ownerId === 'string' ? entry.ownerId : entry.ownerId?._id;
        return ownerId === user?.id;
      });

      setRestaurant(userRestaurant);
      if (userRestaurant) {
        await Promise.all([
          fetchMenu(userRestaurant._id),
          fetchOrders(userRestaurant._id),
        ]);
      }
    } catch (error) {
      setError('Failed to fetch restaurant details.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const fetchMenu = async (restaurantId) => {
    try {
      const response = await restaurantAPI.getMenu(restaurantId);
      setMenu(response.data);
    } catch (error) {
      setError('Failed to fetch menu items.');
    }
  };

  const fetchOrders = async (restaurantId) => {
    try {
      const response = await orderAPI.getRestaurantOrders(restaurantId);
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch restaurant orders.');
    }
  };

  const registerRestaurant = async (event) => {
    event.preventDefault();
    setError('');
    setFeedback('');

    try {
      const response = await restaurantAPI.registerRestaurant(newRestaurant);
      setRestaurant(response.data.restaurant);
      setNewRestaurant({ name: '', location: '' });
      setFeedback('Restaurant registered. It will appear publicly once an admin approves it.');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to register restaurant.');
    }
  };

  const addMenuItem = async () => {
    if (!restaurant) {
      return;
    }

    setError('');
    setFeedback('');

    try {
      await restaurantAPI.addMenuItem({ ...newItem, price: Number(newItem.price) });
      setNewItem({ name: '', price: '' });
      await fetchMenu(restaurant._id);
      setFeedback('Menu item added successfully.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add menu item.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setError('');
    setFeedback('');

    try {
      await orderAPI.updateOrderStatus(orderId, status);
      await fetchOrders(restaurant._id);
      setFeedback(`Order moved to ${status}.`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="section-eyebrow">Restaurant owner workspace</div>
          <h1>Run service, menu, and fulfillment from one place.</h1>
          <p className="section-copy">This dashboard is tied to your approved restaurant record and live order queue.</p>
        </div>
        <div className="header-actions">
          <div className="user-pill">{user?.name || 'Restaurant Owner'}</div>
          <button className="secondary-button" onClick={logout}>Logout</button>
        </div>
      </header>

      {error ? <div className="form-message error">{error}</div> : null}
      {feedback ? <div className="form-message success">{feedback}</div> : null}

      {loading ? <p className="muted">Loading your workspace...</p> : null}

      {!restaurant ? (
        <section className="panel narrow-panel">
          <div className="panel-heading">
            <h2>Register your restaurant</h2>
            <span>Owner setup</span>
          </div>

          <form className="auth-form" onSubmit={registerRestaurant}>
            <label>
              <span>Restaurant name</span>
              <input
                type="text"
                placeholder="Studio Kitchen"
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Location</span>
              <input
                type="text"
                placeholder="Colombo 07"
                value={newRestaurant.location}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })}
                required
              />
            </label>

            <button className="primary-button" type="submit">Register restaurant</button>
          </form>
        </section>
      ) : (
        <>
          <section className="dashboard-grid owner-grid">
            <div className="panel">
              <div className="panel-heading">
                <h2>{restaurant.name}</h2>
                <span>{restaurant.isApproved ? 'Approved' : 'Pending approval'}</span>
              </div>
              <p className="section-copy">{restaurant.location || 'No location provided yet.'}</p>
              <div className={`status-pill ${restaurant.isApproved ? 'status-confirmed' : 'status-pending'}`}>
                {restaurant.isApproved ? 'Ready to receive orders' : 'Waiting for admin approval'}
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Add menu item</h2>
                <span>{menu.length} live items</span>
              </div>

              <div className="inline-form">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  disabled={!restaurant.isApproved}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  disabled={!restaurant.isApproved}
                />
                <button className="primary-button small" onClick={addMenuItem} disabled={!restaurant.isApproved}>
                  Add item
                </button>
              </div>
            </div>
          </section>

          <section className="dashboard-grid owner-grid">
            <div className="panel">
              <div className="panel-heading">
                <h2>Menu</h2>
                <span>{menu.length} items</span>
              </div>

              <div className="card-list compact">
                {menu.map((item) => (
                  <div key={item._id} className="stack-card">
                    <div>
                      <strong>{item.name}</strong>
                      <span>Available now</span>
                    </div>
                    <strong>${Number(item.price).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Orders</h2>
                <span>{orders.length} total</span>
              </div>

              <div className="card-list compact">
                {orders.map((order) => (
                  <article key={order._id} className="order-card">
                    <div className="order-card-header">
                      <strong>Order #{order._id.slice(-6)}</strong>
                      <div className={`status-pill status-${order.status}`}>{order.status}</div>
                    </div>
                    <p>{order.items?.length || 0} items</p>
                    <p>Total: ${Number(order.totalPrice || 0).toFixed(2)}</p>
                    <div className="button-row">
                      {nextStatusMap[order.status] ? (
                        <button
                          className="primary-button small"
                          onClick={() => updateOrderStatus(order._id, nextStatusMap[order.status])}
                        >
                          Move to {nextStatusMap[order.status]}
                        </button>
                      ) : (
                        <span className="muted">Delivery flow complete</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default RestaurantDashboard;
