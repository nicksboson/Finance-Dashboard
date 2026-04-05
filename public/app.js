/**
 * app.js — Finance Backend Frontend
 *
 * All API communication is done via fetch().
 * The active user's MongoDB _id is sent as the x-user-id header on every request.
 * No framework — plain vanilla JavaScript only.
 *
 * Bootstrap flow:
 *   1. On load, call GET /api/users/directory (public, no auth) to populate
 *      the session selector dropdown.
 *   2. Restore last-used user from localStorage so the page stays usable on reload.
 *   3. After creating a user, auto-select that user and refresh the dropdown.
 */

'use strict';

const BASE_URL = '';
const LS_USER_KEY = 'finance_active_user_id';

// ─── Utilities ────────────────────────────────────────────────────────────────

function getActiveUserId() {
  return document.getElementById('active-user-select').value;
}

function buildHeaders(includeJson = false) {
  const userId = getActiveUserId();
  const headers = {};
  if (userId) headers['x-user-id'] = userId;
  if (includeJson) headers['Content-Type'] = 'application/json';
  return headers;
}

function showMsg(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = 'msg ' + (isError ? 'error' : 'success');
}

function clearMsg(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = '';
  el.className = 'msg';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toISOString().slice(0, 10);
}

function formatAmount(val) {
  return Number(val).toFixed(2);
}

// ─── Active User Selector ─────────────────────────────────────────────────────

/**
 * Loads active users from the public /directory endpoint (no auth required)
 * and rebuilds the session selector dropdown.
 * Restores the previously selected user from localStorage on first load.
 *
 * @param {string|null} forceSelectId  Force-select this ID after rebuild (e.g. after creation).
 */
async function loadUsersIntoSelector(forceSelectId = null) {
  try {
    const res = await fetch(`${BASE_URL}/api/users/directory`);
    const json = await res.json();
    if (!json.success) return;

    const select = document.getElementById('active-user-select');
    const targetId = forceSelectId || localStorage.getItem(LS_USER_KEY) || select.value;

    select.innerHTML = '<option value="">— select a user —</option>';
    json.data.forEach((user) => {
      const opt = document.createElement('option');
      opt.value = user._id;
      opt.textContent = `${user.name} (${user.role})`;
      opt.dataset.role = user.role;
      opt.dataset.status = user.status;
      if (user._id === targetId) opt.selected = true;
      select.appendChild(opt);
    });

    updateRoleBadge();
  } catch (err) {
    console.warn('[selector] Could not load user directory:', err.message);
  }
}

function updateRoleBadge() {
  const select = document.getElementById('active-user-select');
  const badge = document.getElementById('active-user-role');
  const selected = select.options[select.selectedIndex];
  const role = selected && selected.dataset.role;
  badge.textContent = role || '';

  const userId = select.value;
  if (userId) {
    localStorage.setItem(LS_USER_KEY, userId);
  } else {
    localStorage.removeItem(LS_USER_KEY);
  }
}

document.getElementById('active-user-select').addEventListener('change', updateRoleBadge);

// ─── User Management ──────────────────────────────────────────────────────────

// POST /api/users — create user
document.getElementById('create-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById('user-name').value.trim(),
    email: document.getElementById('user-email').value.trim(),
    password: document.getElementById('user-password').value,
    role: document.getElementById('user-role').value,
  };

  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (json.success) {
      showMsg('user-form-msg', `User "${json.data.name}" created successfully.`);
      e.target.reset();
      await loadUsersIntoSelector(json.data._id);
    } else {
      showMsg('user-form-msg', json.message, true);
    }
  } catch {
    showMsg('user-form-msg', 'Network error — could not reach server.', true);
  }
});

// GET /api/users — load users table (admin/analyst/viewer)
document.getElementById('btn-load-users').addEventListener('click', loadUsers);

async function loadUsers() {
  try {
    const res = await fetch(`${BASE_URL}/api/users`, { headers: buildHeaders() });
    const json = await res.json();

    if (!json.success) {
      showMsg('user-form-msg', json.message || 'Failed to load users. Select an active user first.', true);
      return;
    }

    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    if (json.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
      return;
    }

    json.data.forEach((user) => {
      const tr = document.createElement('tr');
      tr.dataset.userId = user._id;
      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <select class="user-role-select" data-id="${user._id}">
            <option value="viewer"   ${user.role === 'viewer'   ? 'selected' : ''}>viewer</option>
            <option value="analyst"  ${user.role === 'analyst'  ? 'selected' : ''}>analyst</option>
            <option value="admin"    ${user.role === 'admin'    ? 'selected' : ''}>admin</option>
          </select>
        </td>
        <td>
          <select class="user-status-select" data-id="${user._id}">
            <option value="active"   ${user.status === 'active'   ? 'selected' : ''}>active</option>
            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>inactive</option>
          </select>
        </td>
        <td>${formatDate(user.createdAt)}</td>
        <td>
          <button class="btn-update-user" data-id="${user._id}" type="button">Update</button>
          <button class="btn-delete-user" data-id="${user._id}" type="button">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // PATCH /api/users/:id — update role/status
    tbody.querySelectorAll('.btn-update-user').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const role   = tbody.querySelector(`.user-role-select[data-id="${id}"]`).value;
        const status = tbody.querySelector(`.user-status-select[data-id="${id}"]`).value;

        try {
          const res = await fetch(`${BASE_URL}/api/users/${id}`, {
            method: 'PATCH',
            headers: buildHeaders(true),
            body: JSON.stringify({ role, status }),
          });
          const json = await res.json();

          if (json.success) {
            showMsg('user-form-msg', 'User updated successfully.');
            await loadUsersIntoSelector(); // refresh selector in case role changed
          } else {
            showMsg('user-form-msg', json.message, true);
          }
        } catch {
          showMsg('user-form-msg', 'Network error — could not update user.', true);
        }
      });
    });

    // DELETE /api/users/:id
    tbody.querySelectorAll('.btn-delete-user').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        const id = btn.dataset.id;

        try {
          const res = await fetch(`${BASE_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(),
          });
          const json = await res.json();

          if (json.success) {
            showMsg('user-form-msg', 'User deleted successfully.');
            btn.closest('tr').remove();
            await loadUsersIntoSelector();
          } else {
            showMsg('user-form-msg', json.message, true);
          }
        } catch {
          showMsg('user-form-msg', 'Network error — could not delete user.', true);
        }
      });
    });

    showMsg('user-form-msg', `${json.data.length} user(s) loaded.`);
  } catch {
    showMsg('user-form-msg', 'Network error — could not load users.', true);
  }
}

// ─── Financial Records ────────────────────────────────────────────────────────

// POST /api/records — create record
document.getElementById('create-record-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    amount:   parseFloat(document.getElementById('rec-amount').value),
    type:     document.getElementById('rec-type').value,
    category: document.getElementById('rec-category').value.trim(),
    date:     document.getElementById('rec-date').value,
    note:     document.getElementById('rec-note').value.trim(),
  };

  try {
    const res = await fetch(`${BASE_URL}/api/records`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (json.success) {
      showMsg(
        'record-form-msg',
        `Record created: ${json.data.type} of ${formatAmount(json.data.amount)} in "${json.data.category}".`
      );
      e.target.reset();
    } else {
      showMsg('record-form-msg', json.message, true);
    }
  } catch {
    showMsg('record-form-msg', 'Network error — could not create record.', true);
  }
});

// GET /api/records — load records with optional filters
document.getElementById('btn-load-records').addEventListener('click', loadRecords);

async function loadRecords() {
  const type     = document.getElementById('filter-type').value;
  const category = document.getElementById('filter-category').value.trim();
  const date     = document.getElementById('filter-date').value;

  const params = new URLSearchParams();
  if (type)     params.set('type', type);
  if (category) params.set('category', category);
  if (date)     params.set('date', date);

  const url = `${BASE_URL}/api/records${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const res  = await fetch(url, { headers: buildHeaders() });
    const json = await res.json();

    if (!json.success) {
      showMsg('record-form-msg', json.message || 'Failed to load records. Select an active user first.', true);
      return;
    }

    const tbody = document.getElementById('records-tbody');
    tbody.innerHTML = '';

    if (json.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No records found.</td></tr>';
      return;
    }

    json.data.forEach((rec) => {
      const tr = document.createElement('tr');
      tr.dataset.recordId = rec._id;
      tr.innerHTML = `
        <td>${formatAmount(rec.amount)}</td>
        <td>${rec.type}</td>
        <td>${rec.category}</td>
        <td>${formatDate(rec.date)}</td>
        <td>${rec.note || '—'}</td>
        <td>
          <button class="btn-edit-record"   data-id="${rec._id}" type="button">Edit</button>
          <button class="btn-delete-record" data-id="${rec._id}" type="button">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Inline edit: replace row with editable form
    tbody.querySelectorAll('.btn-edit-record').forEach((btn) => {
      btn.addEventListener('click', () => openRecordEditRow(btn.dataset.id, tbody));
    });

    // DELETE /api/records/:id
    tbody.querySelectorAll('.btn-delete-record').forEach((btn) => {
      btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
    });

    showMsg('record-form-msg', `${json.data.length} record(s) loaded.`);
  } catch {
    showMsg('record-form-msg', 'Network error — could not load records.', true);
  }
}

/**
 * Replaces a record's table row with an inline edit form.
 * On save → PATCH /api/records/:id. On cancel → restore original row.
 */
function openRecordEditRow(id, tbody) {
  const tr = tbody.querySelector(`tr[data-record-id="${id}"]`);
  if (!tr) return;

  // Read current values from cells
  const [amountCell, typeCell, categoryCell, dateCell, noteCell] = tr.cells;

  const originalHTML = tr.innerHTML;

  tr.innerHTML = `
    <td><input class="edit-amount"   type="number" min="0" step="0.01" value="${amountCell.textContent}" /></td>
    <td>
      <select class="edit-type">
        <option value="income"  ${typeCell.textContent === 'income'  ? 'selected' : ''}>income</option>
        <option value="expense" ${typeCell.textContent === 'expense' ? 'selected' : ''}>expense</option>
      </select>
    </td>
    <td><input class="edit-category" type="text" value="${categoryCell.textContent}" /></td>
    <td><input class="edit-date"     type="date" value="${dateCell.textContent}" /></td>
    <td><input class="edit-note"     type="text" value="${noteCell.textContent === '—' ? '' : noteCell.textContent}" /></td>
    <td>
      <button class="btn-save-record"   data-id="${id}" type="button">Save</button>
      <button class="btn-cancel-record" type="button">Cancel</button>
    </td>
  `;

  // Cancel — restore original row HTML
  tr.querySelector('.btn-cancel-record').addEventListener('click', () => {
    tr.innerHTML = originalHTML;
    tr.querySelector('.btn-edit-record').addEventListener('click', () => openRecordEditRow(id, tbody));
    tr.querySelector('.btn-delete-record').addEventListener('click', () => deleteRecord(id));
  });

  // Save — PATCH /api/records/:id
  tr.querySelector('.btn-save-record').addEventListener('click', async () => {
    const body = {
      amount:   parseFloat(tr.querySelector('.edit-amount').value),
      type:     tr.querySelector('.edit-type').value,
      category: tr.querySelector('.edit-category').value.trim(),
      date:     tr.querySelector('.edit-date').value,
      note:     tr.querySelector('.edit-note').value.trim(),
    };

    try {
      const res  = await fetch(`${BASE_URL}/api/records/${id}`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        showMsg('record-form-msg', 'Record updated successfully.');
        loadRecords(); // refresh the full table to reflect the update
      } else {
        showMsg('record-form-msg', json.message, true);
      }
    } catch {
      showMsg('record-form-msg', 'Network error — could not update record.', true);
    }
  });
}

async function deleteRecord(id) {
  if (!confirm('Delete this record?')) return;

  try {
    const res  = await fetch(`${BASE_URL}/api/records/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    const json = await res.json();

    if (json.success) {
      showMsg('record-form-msg', 'Record deleted.');
      loadRecords();
    } else {
      showMsg('record-form-msg', json.message, true);
    }
  } catch {
    showMsg('record-form-msg', 'Network error — could not delete record.', true);
  }
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

document.getElementById('btn-load-summary').addEventListener('click', async () => {
  try {
    const res  = await fetch(`${BASE_URL}/api/dashboard/summary`, { headers: buildHeaders() });
    const json = await res.json();

    if (!json.success) {
      showMsg('summary-msg', json.message || 'Failed to load summary. Select an active user first.', true);
      document.getElementById('summary-cards').style.display  = 'none';
      document.getElementById('category-wrap').style.display  = 'none';
      document.getElementById('recent-wrap').style.display    = 'none';
      return;
    }

    clearMsg('summary-msg');
    const d = json.data;

    // Totals cards
    document.getElementById('sum-income').textContent  = formatAmount(d.totalIncome);
    document.getElementById('sum-expense').textContent = formatAmount(d.totalExpense);

    const balanceEl = document.getElementById('sum-balance');
    balanceEl.textContent = formatAmount(d.netBalance);
    balanceEl.className   = d.netBalance < 0 ? 'card-value negative' : 'card-value';

    document.getElementById('summary-cards').style.display = 'flex';

    // Category totals table
    const catTbody = document.getElementById('category-tbody');
    catTbody.innerHTML = '';
    if (d.categoryTotals.length === 0) {
      catTbody.innerHTML = '<tr><td colspan="3">No data.</td></tr>';
    } else {
      d.categoryTotals.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.type}</td><td>${row.category}</td><td>${formatAmount(row.total)}</td>`;
        catTbody.appendChild(tr);
      });
    }
    document.getElementById('category-wrap').style.display = 'block';

    // Recent transactions (last 5)
    const recentTbody = document.getElementById('recent-tbody');
    recentTbody.innerHTML = '';
    if (d.recentTransactions.length === 0) {
      recentTbody.innerHTML = '<tr><td colspan="5">No data.</td></tr>';
    } else {
      d.recentTransactions.forEach((rec) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatAmount(rec.amount)}</td>
          <td>${rec.type}</td>
          <td>${rec.category}</td>
          <td>${formatDate(rec.date)}</td>
          <td>${rec.note || '—'}</td>
        `;
        recentTbody.appendChild(tr);
      });
    }
    document.getElementById('recent-wrap').style.display = 'block';
  } catch {
    showMsg('summary-msg', 'Network error — could not load summary.', true);
  }
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
loadUsersIntoSelector();
