import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { restaurantAPI, orderAPI } from '../services/api';

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [restaurantResponse, orderResponse] = await Promise.all([
          restaurantAPI.getRestaurants(),
          orderAPI.getOrderHistory(),
        ]);

        setRestaurants(restaurantResponse.data);
        setOrders(orderResponse.data);
      } catch (error) {
        setError('Unable to load restaurants and orders right now.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchMenu = async (restaurantId) => {
    try {
      setFeedback('');
      const response = await restaurantAPI.getMenu(restaurantId);
      setMenu(response.data);
    } catch (error) {
      setError('Failed to fetch menu items for this restaurant.');
    }
  };

  const addToCart = (item) => {
    setFeedback('');
    setCart((currentCart) => {
      const existingItem = currentCart.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        return currentCart.map((cartItem) => (
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart((currentCart) => currentCart
      .map((item) => item._id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item)
      .filter((item) => item.quantity > 0));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const placeOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) {
      return;
    }

    setError('');
    setFeedback('');
    setPlacingOrder(true);

    try {
      await orderAPI.placeOrder({
        restaurantId: selectedRestaurant._id,
        totalPrice: cartTotal,
        items: cart.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      setCart([]);
      const refreshedOrders = await orderAPI.getOrderHistory();
      setOrders(refreshedOrders.data);
      setFeedback('Order placed successfully.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="section-eyebrow">Customer dashboard</div>
          <h1>Find your next meal fast.</h1>
          <p className="section-copy">Browse approved restaurants, review menus, and place orders through the order service.</p>
        </div>
        <div className="header-actions">
          <div className="user-pill">{user?.name || 'Customer'}</div>
          <button className="secondary-button" onClick={logout}>Logout</button>
        </div>
      </header>

      {error ? <div className="form-message error">{error}</div> : null}
      {feedback ? <div className="form-message success">{feedback}</div> : null}

      <section className="dashboard-grid customer-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Restaurants</h2>
            <span>{restaurants.length} available</span>
          </div>

          {loading ? <p className="muted">Loading restaurants...</p> : null}

          <div className="card-list">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant._id}
                className={`restaurant-card ${selectedRestaurant?._id === restaurant._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  fetchMenu(restaurant._id);
                }}
              >
                <strong>{restaurant.name}</strong>
                <span>{restaurant.location || 'Location not provided'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>{selectedRestaurant ? `${selectedRestaurant.name} menu` : 'Menu preview'}</h2>
            <span>{selectedRestaurant ? `${menu.length} items` : 'Choose a restaurant'}</span>
          </div>

          {!selectedRestaurant ? <p className="muted">Pick a restaurant on the left to explore its menu.</p> : null}

          <div className="menu-grid">
            {menu.map((item) => (
              <article key={item._id} className="menu-card">
                <div>
                  <h3>{item.name}</h3>
                  <p>Freshly prepared and ready for your next order.</p>
                </div>
                <div className="menu-card-footer">
                  <strong>{`Rs. ${Number(item.price).toFixed(2)}`}</strong>
                  <button className="primary-button small" onClick={() => addToCart(item)}>Add</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Cart</h2>
            <span>{cart.length} selections</span>
          </div>

          {cart.length === 0 ? <p className="muted">Your cart is empty. Add a few items to place an order.</p> : null}

          <div className="stack-list">
            {cart.map((item) => (
              <div key={item._id} className="stack-card">
                <div>
                  <strong>{item.name}</strong>
                  <span>{`Rs. ${Number(item.price).toFixed(2)} each`}</span>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-strip">
            <span>Total</span>
            <strong>{`Rs. ${cartTotal.toFixed(2)}`}</strong>
          </div>

          <button
            className="primary-button full-width"
            onClick={placeOrder}
            disabled={!selectedRestaurant || cart.length === 0 || placingOrder}
          >
            {placingOrder ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Your recent orders</h2>
          <span>{orders.length} total</span>
        </div>

        <div className="table-like-list">
          {orders.map((order) => (
            <div key={order._id} className="table-row">
              <div>
                <strong>{order.restaurantId?.name || 'Restaurant'}</strong>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className={`status-pill status-${order.status}`}>{order.status}</div>
              <strong>{`Rs. ${Number(order.totalPrice || 0).toFixed(2)}`}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
