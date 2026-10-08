import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api.js';
import TableForm from '../../components/TableForm.jsx';
import Modal from '../../components/Modal.jsx';
import Loading from '../../components/Loading.jsx';

// Table status uses its own badge colours
const tableBadgeClass = {
  Available: 'badge badge-confirmed',
  Reserved: 'badge badge-pending',
  Maintenance: 'badge badge-cancelled',
};

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // for the dropdown in the form
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadData = async () => {
    try {
      const tablesResponse = await api.get('/tables');
      const restaurantsResponse = await api.get('/restaurants');
      setTables(tablesResponse.data.data);
      setRestaurants(restaurantsResponse.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (table) => {
    setEditing(table);
    setShowForm(true);
  };

  const handleSubmit = async (formValues) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/tables/${editing._id}`, formValues);
        setMessage('Table updated');
      } else {
        await api.post('/tables', formValues);
        setMessage('Table added');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (table) => {
    if (!window.confirm(`Delete table ${table.tableNumber}?`)) return;
    try {
      await api.delete(`/tables/${table._id}`);
      setMessage('Table deleted');
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>Tables</h1>
        <button className="btn btn-primary" onClick={openAddForm}>+ Add Table</button>
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
      {loading && <Loading />}
      {!loading && tables.length === 0 && <p className="empty">No tables yet. Add your first one.</p>}

      {tables.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Restaurant</th><th>Table Number</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table._id}>
                  <td>{table.restaurantId ? table.restaurantId.name : '-'}</td>
                  <td>{table.tableNumber}</td>
                  <td>{table.capacity}</td>
                  <td><span className={tableBadgeClass[table.status]}>{table.status}</span></td>
                  <td className="actions">
                    <button className="btn btn-small btn-outline" onClick={() => openEditForm(table)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(table)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit table' : 'Add table'} onClose={() => setShowForm(false)}>
          <TableForm
            restaurants={restaurants}
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}

export default AdminTables;
