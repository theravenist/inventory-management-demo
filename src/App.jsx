import React, { useState, useEffect } from 'react';
import Login from './Login.jsx';

// Enhanced Dashboard Component with Clickable Sidebar
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [items, setItems] = useState([
    { id: 1, name: 'Laptop', qty: 20, price: 50000 },
    { id: 2, name: 'Mouse', qty: 50, price: 500 },
    { id: 3, name: 'Keyboard', qty: 25, price: 1500 },
    { id: 4, name: 'Monitor', qty: 10, price: 8000 },
  ]);
  const [settings, setSettings] = useState({ currency: '₹', lowStockThreshold: 10 });
  const [newItem, setNewItem] = useState({ name: '', qty: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', qty: '', price: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showHelp, setShowHelp] = useState(false);
  const [contactMessage, setContactMessage] = useState({ name: '', email: '', message: '' });
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    // auto-remove
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('imsUser')) || null;
    } catch (e) {
      return null;
    }
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('inventoryItems');
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (err) {
      console.warn('Failed to load from localStorage', err);
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('inventoryItems', JSON.stringify(items));
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save to localStorage', err);
    }
  }, [items, settings]);
  

  const currency = settings.currency;
  const lowStockThreshold = Number(settings.lowStockThreshold) || 0;
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter === 'all' || (filter === 'low' && item.qty < lowStockThreshold))
  );
  const lowStockCount = filteredItems.filter((i) => i.qty < lowStockThreshold).length;
  const totalValue = filteredItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [invoiceCustomer, setInvoiceCustomer] = useState({ name: '', address: '' });
  const [selectedForInvoice, setSelectedForInvoice] = useState(() => new Set());
  const [orders, setOrders] = useState([]);
  const [priceEditingId, setPriceEditingId] = useState(null);
  const [priceEditValue, setPriceEditValue] = useState('');

  // Products Actions
  const addItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.qty !== '' && newItem.price !== '') {
      const id = Date.now();
      setItems([
        ...items,
        { id, name: newItem.name, qty: parseInt(newItem.qty, 10), price: parseFloat(newItem.price) },
      ]);
      setNewItem({ name: '', qty: '', price: '' });
    }
  };

  const deleteItem = (id) => {
    if (window.confirm('Delete this item?')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, qty: String(item.qty), price: String(item.price) });
  };

  const saveEdit = () => {
    setItems(
      items.map((item) =>
        item.id === editingId
          ? (() => {
              // support relative qty edits like "+5" or "-10" to adjust existing stock
              const raw = String(editForm.qty || '').trim();
              let newQty = item.qty;
              if (raw.length > 0) {
                if (/^[+-]/.test(raw)) {
                  const delta = parseInt(raw, 10);
                  if (!Number.isNaN(delta)) newQty = Math.max(0, Number(item.qty || 0) + delta);
                } else {
                  const absolute = parseInt(raw, 10);
                  if (!Number.isNaN(absolute)) newQty = Math.max(0, absolute);
                }
              }
              return { ...item, name: editForm.name, qty: newQty, price: parseFloat(editForm.price) };
            })()
          : item
      )
    );
    setEditingId(null);
    setEditForm({ name: '', qty: '', price: '' });
    addToast('Product updated.', 'success');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', qty: '', price: '' });
  };

  // Settings Actions
  const updateSettings = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  

  

  

  // Customer Service Action
  const submitContact = (e) => {
    e.preventDefault();
    if (contactMessage.name && contactMessage.email && contactMessage.message) {
      addToast(`Thank you, ${contactMessage.name}! Your message has been sent to support. (Simulated)`, 'success');
      setContactMessage({ name: '', email: '', message: '' });
    } else {
      addToast('Please fill all fields.', 'warning');
    }
  };

  // Sidebar
  const Sidebar = (
    <aside className="sidebar">
      <h2>Inventory System</h2>
      {user && (
        <div style={{ fontSize: 12, marginBottom: 10 }}>
          <div>{user.company || user.email}</div>
          <button
            onClick={() => {
              setUser(null);
              try {
                localStorage.removeItem('imsUser');
              } catch (e) {}
            }}
            style={{ marginTop: 6, padding: '6px 8px', fontSize: 12 }}
          >
            Logout
          </button>
        </div>
      )}
      <ul>
        <li className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>
          Dashboard
        </li>
        <li className={currentPage === 'products' ? 'active' : ''} onClick={() => setCurrentPage('products')}>
          Products
        </li>
        <li className={currentPage === 'reports' ? 'active' : ''} onClick={() => setCurrentPage('reports')}>
          Reports
        </li>
        <li className={currentPage === 'settings' ? 'active' : ''} onClick={() => setCurrentPage('settings')}>
          Settings
        </li>
      </ul>
    </aside>
  );

  // Main Content
  const handleLogin = (usr) => {
    setUser(usr);
    try {
      localStorage.setItem('imsUser', JSON.stringify(usr));
    } catch (e) {}
  };

  // Load orders for current user
  useEffect(() => {
    try {
      if (user && user.email) {
        const key = `orders_${user.email}`;
        const raw = localStorage.getItem(key);
        setOrders(raw ? JSON.parse(raw) : []);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.warn('Failed to load orders', e);
      setOrders([]);
    }
  }, [user]);

  const saveOrderToUser = (order) => {
    if (!user || !user.email) {
      addToast('No logged-in user to assign order to.', 'warning');
      return;
    }
    const key = `orders_${user.email}`;
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(order);
      localStorage.setItem(key, JSON.stringify(list));
      setOrders(list);
      addToast('Order saved to your account.', 'success');
    } catch (e) {
      console.error('Failed to save order', e);
      addToast('Failed to save order locally.', 'error');
    }
  };

  const deleteOrder = (id) => {
    if (!user || !user.email) return;
    const key = `orders_${user.email}`;
    if (!window.confirm('Delete this order?')) return;
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const next = list.filter((o) => o.id !== id);
      localStorage.setItem(key, JSON.stringify(next));
      setOrders(next);
      addToast('Order deleted.', 'info');
    } catch (e) {
      console.error(e);
      addToast('Failed to delete order.', 'error');
    }
  };

  // Quick quantity update (+/-) and inline price edit helpers
  const updateQuantity = (id, delta) => {
    // update using functional setter to avoid stale state; persistence handled by effect
    setItems((prev) =>
      prev.map((it) => (it.id !== id ? it : { ...it, qty: Math.max(0, Number(it.qty || 0) + Number(delta)) }))
    );
  };

  const startPriceEdit = (item) => {
    setPriceEditingId(item.id);
    setPriceEditValue(String(item.price));
  };

  const savePriceEdit = () => {
    setItems((prev) => prev.map((it) => (it.id === priceEditingId ? { ...it, price: parseFloat(priceEditValue || 0) } : it)));
    setPriceEditingId(null);
    setPriceEditValue('');
    addToast('Price updated.', 'success');
  };

  const cancelPriceEdit = () => {
    setPriceEditingId(null);
    setPriceEditValue('');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  let mainContent = null;
  if (currentPage === 'dashboard') {
    mainContent = (
      <main className="main-content">
        <header className="header">
          <h1>Welcome, {user && (user.company || user.email) ? (user.company || user.email) : 'Admin'} 👋</h1>
          <p>Manage and track your inventory efficiently.</p>
        </header>
        <section className="stats">
          <div className="card">
            <h3>Total Products</h3>
            <p>{items.length}</p>
          </div>
          <div className="card">
            <h3>Low Stock</h3>
            <p>{lowStockCount}</p>
          </div>
          <div className="card">
            <h3>Total Inventory Value</h3>
            <p>{`${currency}${totalValue.toLocaleString()}`}</p>
          </div>
        </section>
        <section className="table-section">
          <h2>Inventory List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{`${currency}${item.price}`}</td>
                  <td>{`${currency}${item.price * item.qty}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    );
  } else if (currentPage === 'products') {
    mainContent = (
      <main className="main-content">
        <section className="products-section">
          <h2>Manage Products</h2>
          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="low">Low Stock</option>
            </select>
            <span style={{ marginLeft: 12, color: '#7f8c8d' }}>Threshold: {lowStockThreshold}</span>
          </div>

          <form onSubmit={addItem}>
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.qty}
              onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              required
            />
            <button type="submit">Add Product</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLow = item.qty < lowStockThreshold;
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        <span className={isLow ? 'low-stock' : ''}>{item.name}</span>
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        (() => {
                          const raw = String(editForm.qty || '').trim();
                          let preview = '';
                          if (raw.length > 0) {
                            if (/^[+-]/.test(raw)) {
                              const delta = parseInt(raw, 10);
                              if (!Number.isNaN(delta)) preview = Math.max(0, Number(item.qty || 0) + delta);
                            } else {
                              const absolute = parseInt(raw, 10);
                              if (!Number.isNaN(absolute)) preview = Math.max(0, absolute);
                            }
                          }
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                type="button"
                                className="small-btn"
                                onClick={() => setEditForm({ ...editForm, qty: String(Math.max(0, Number(editForm.qty || 0) - 1)) })}
                              >
                                -
                              </button>
                              <input
                                type="text"
                                value={editForm.qty}
                                onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                style={{ width: 120 }}
                                placeholder={String(item.qty)}
                              />
                              <button
                                type="button"
                                className="small-btn"
                                onClick={() => setEditForm({ ...editForm, qty: String(Math.max(0, Number(editForm.qty || 0) + 1)) })}
                              >
                                +
                              </button>
                              {preview !== '' && String(preview) !== String(item.qty) && (
                                <span style={{ color: '#5567ff', fontWeight: 600 }}>→ {preview}</span>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button type="button" className="small-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                          <span>{item.qty}</span>
                          <button type="button" className="small-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      ) : priceEditingId === item.id ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="number"
                            value={priceEditValue}
                            onChange={(e) => setPriceEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePriceEdit();
                              if (e.key === 'Escape') cancelPriceEdit();
                            }}
                            style={{ width: 110 }}
                          />
                          <button type="button" className="btn-warning" onClick={savePriceEdit}>Save</button>
                          <button type="button" onClick={cancelPriceEdit}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span>{`${currency}${item.price}`}</span>
                          <button type="button" className="small-btn" onClick={() => startPriceEdit(item)} title="Edit price">✎</button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <>
                          <button type="button" className="btn-warning" onClick={saveEdit} style={{ marginRight: 6 }}>
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(item)} style={{ marginRight: 6 }}>
                            Edit
                          </button>
                          <button type="button" className="btn-danger" onClick={() => deleteItem(item.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="help-section">
            <h3 onClick={() => setShowHelp((s) => !s)}>
              Help <span className="toggle-icon">{showHelp ? '▾' : '▸'}</span>
            </h3>
            <div className={showHelp ? 'help-content active' : 'help-content'}>
              <div className="faq-item">How to add products: use the form above.</div>
              <div className="faq-item">Edit products inline by clicking Edit.</div>
              <div className="faq-item">Data is saved locally in your browser.</div>
            </div>
          </div>

          {/* customer service moved to Settings */}
        </section>
      </main>
    );
  } else if (currentPage === 'reports') {
    const lowItems = items.filter((i) => i.qty < lowStockThreshold);
    mainContent = (
      <main className="main-content">
        <section className="reports-section">
          <h2>Reports</h2>
          <div className="report-item">Total SKUs: {items.length}</div>
          <div className="report-item">Total Inventory Value: {`${currency}${items.reduce((s, i) => s + i.qty * i.price, 0).toLocaleString()}`}</div>
          <h3 style={{ marginTop: 12 }}>Low Stock Items</h3>
          <ul className="report-list">
            {lowItems.length ? (
              lowItems.map((it) => (
                <li key={it.id} className="report-item">
                  {it.name} — {it.qty} remaining
                </li>
              ))
            ) : (
              <li className="report-item">No low stock items.</li>
            )}
          </ul>

          <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px dashed #e6e6e6' }}>
            <h3>Billing / Invoice</h3>
            <p>Select items to include in the invoice, enter customer details, then download a PDF invoice.</p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13 }}>Customer name</label>
                  <input
                    style={{ width: '100%', marginTop: 4 }}
                    value={invoiceCustomer.name}
                    onChange={(e) => setInvoiceCustomer((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Customer or company name"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13 }}>Address (optional)</label>
                  <textarea
                    style={{ width: '100%', marginTop: 4 }}
                    value={invoiceCustomer.address}
                    onChange={(e) => setInvoiceCustomer((c) => ({ ...c, address: e.target.value }))}
                    placeholder="Customer address"
                  />
                </div>
              </div>

              <div style={{ width: 360 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Items</strong>
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedForInvoice(new Set(items.map((i) => i.id)))}
                      style={{ marginRight: 6 }}
                    >
                      Select all
                    </button>
                    <button type="button" onClick={() => setSelectedForInvoice(new Set())}>Clear</button>
                  </div>
                </div>
                <div style={{ maxHeight: 180, overflow: 'auto', marginTop: 8, border: '1px solid #eee', padding: 8 }}>
                  {items.map((it) => (
                    <label key={it.id} style={{ display: 'block', marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={selectedForInvoice.has(it.id)}
                        onChange={(e) => {
                          const s = new Set(selectedForInvoice);
                          if (e.target.checked) s.add(it.id); else s.delete(it.id);
                          setSelectedForInvoice(s);
                        }}
                        style={{ marginRight: 8 }}
                      />
                      {it.name} — {it.qty} × {currency}{it.price}
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button
                    onClick={async () => {
                      // gather selected items
                      const sel = items.filter((i) => selectedForInvoice.has(i.id));
                      if (sel.length === 0) {
                        addToast('No items selected for invoice.', 'warning');
                        return;
                      }
                      if (!invoiceCustomer.name) {
                        addToast('Please enter a customer name.', 'warning');
                        return;
                      }
                      try {
                        // Load jspdf and autotable from CDN at runtime if not already available.
                        const ensureJspdf = () =>
                          new Promise((resolve, reject) => {
                            if (window.jspdf && (window.jspdf.jsPDF || (window.jspdf.default && window.jspdf.default.jsPDF))) {
                              return resolve(window.jspdf);
                            }
                            const s = document.createElement('script');
                            s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
                            s.onload = () => resolve(window.jspdf);
                            s.onerror = () => reject(new Error('Failed to load jspdf from CDN'));
                            document.head.appendChild(s);
                          });

                        const ensureAutoTable = () =>
                          new Promise((resolve, reject) => {
                            // autotable attaches to jspdf after loading
                            if (window.jspdf && (window.jspdf.jsPDF && window.jspdf.jsPDF.prototype && window.jspdf.jsPDF.prototype.autoTable)) {
                              return resolve();
                            }
                            const s2 = document.createElement('script');
                            s2.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.28/dist/jspdf.plugin.autotable.js';
                            s2.onload = () => resolve();
                            s2.onerror = () => reject(new Error('Failed to load jspdf-autotable from CDN'));
                            document.head.appendChild(s2);
                          });

                        await ensureJspdf();
                        await ensureAutoTable();

                        const jsPDFCtor = (window.jspdf && (window.jspdf.jsPDF || (window.jspdf.default && window.jspdf.default.jsPDF)));
                        if (!jsPDFCtor) throw new Error('jsPDF not available');
                        const doc = new jsPDFCtor();
                        doc.setFontSize(14);
                        doc.text('Invoice', 14, 20);
                        doc.setFontSize(10);
                        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 28);
                        doc.text(`Customer: ${invoiceCustomer.name}`, 14, 34);
                        if (invoiceCustomer.address) doc.text(`Address: ${invoiceCustomer.address}`, 14, 40);

                        // Some currency symbols (e.g. ₹) are not supported by the default jsPDF font and
                        // may render as boxes/hashes. Use an ASCII fallback for PDF output.
                        const pdfCurrency = /[^\x00-\x7F]/.test(currency) ? 'Rs.' : currency;
                        const rows = sel.map((it) => [
                          it.name,
                          String(it.qty),
                          `${pdfCurrency}${Number(it.price).toLocaleString()}`,
                          `${pdfCurrency}${Number(it.qty * it.price).toLocaleString()}`,
                        ]);
                        const total = sel.reduce((s, i) => s + i.qty * i.price, 0);

                        // Use autoTable (attached by plugin)
                        // @ts-ignore
                        doc.autoTable({
                          startY: invoiceCustomer.address ? 46 : 44,
                          head: [['Item', 'Qty', 'Price', 'Total']],
                          body: rows,
                        });

                        doc.text(`Total: ${pdfCurrency}${Number(total).toLocaleString()}`, 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 200);
                        doc.save(`invoice-${(invoiceCustomer.name || 'customer').replace(/\s+/g, '_')}-${Date.now()}.pdf`);
                        addToast('Invoice PDF downloaded.', 'success');
                      } catch (err) {
                        console.error('PDF generation failed', err);
                        addToast('PDF generation failed. See console for details.', 'error');
                      }
                    }}
                  >
                    Download Invoice (PDF)
                  </button>
                  <button type="button" onClick={() => { setSelectedForInvoice(new Set()); setInvoiceCustomer({ name: '', address: '' }); addToast('Invoice form cleared.', 'info'); }}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  } else if (currentPage === 'settings') {
    mainContent = (
      <main className="main-content">
        <section className="settings-section">
          <h2>Settings</h2>
          <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              Currency Symbol
              <input value={settings.currency} onChange={(e) => updateSettings('currency', e.target.value)} />
            </label>
            <label>
              Low Stock Threshold
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => updateSettings('lowStockThreshold', Number(e.target.value))}
              />
            </label>
            
            <div>
              <button onClick={() => addToast('Settings saved (persisted automatically).', 'success')}>Save Settings</button>
            </div>
          </form>

          <div className="support-feedback" style={{ marginTop: 20 }}>
            <h3>Support & Feedback</h3>
            <p>Submit queries, feature requests, or feedback. These are saved locally in your browser.</p>

            <div className="customer-service" style={{ marginTop: 12, padding: 12, border: '1px solid #eef2ff', borderRadius: 8, background: '#fff' }}>
              <h4>Contact Customer Service</h4>
              <p style={{ marginTop: 6, color: '#666' }}>Send a quick message to support (simulated - saved locally).</p>
              <form className="contact-form" onSubmit={submitContact} style={{ marginTop: 8 }}>
                <input
                  placeholder="Your name"
                  value={contactMessage.name}
                  onChange={(e) => setContactMessage({ ...contactMessage, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Your email"
                  value={contactMessage.email}
                  onChange={(e) => setContactMessage({ ...contactMessage, email: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Message"
                  value={contactMessage.message}
                  onChange={(e) => setContactMessage({ ...contactMessage, message: e.target.value })}
                  required
                />
                <div style={{ marginTop: 8 }}>
                  <button type="submit" className="contact-btn">Send to Support</button>
                  <button type="button" style={{ marginLeft: 8 }} onClick={() => setContactMessage({ name: '', email: '', message: '' })}>Clear</button>
                </div>
              </form>
            </div>

            {/* Feedback/Queries removed as requested */}

            <div className="settings-help" style={{ marginTop: 18 }}>
              <div className="help-content" style={{ marginTop: 8, color: '#444' }}>
                <p>
                  Use this panel to change currency or low-stock threshold. The Contact form sends a simulated message locally.
                  For production apps, contact messages and feedback should be sent to a server or ticketing system.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard">
      {Sidebar}
      {mainContent}

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 360,
        }}
      >
        {toasts.map((t) => {
          let bg = '#fff';
          let border = '#ddd';
          if (t.type === 'success') {
            bg = '#e6ffed';
            border = '#2ecc71';
          } else if (t.type === 'warning') {
            bg = '#fff8e6';
            border = '#f39c12';
          } else if (t.type === 'error') {
            bg = '#ffecec';
            border = '#e74c3c';
          } else if (t.type === 'info') {
            bg = '#e8f4ff';
            border = '#3498db';
          }
          return (
            <div
              key={t.id}
              style={{
                background: bg,
                borderLeft: `4px solid ${border}`,
                padding: '10px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: 4,
                color: '#111',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ marginRight: 8, flex: 1 }}>{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                style={{ marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
