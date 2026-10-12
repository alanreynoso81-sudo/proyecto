const loanForm = document.querySelector('#loanForm');
const loansTableBody = document.querySelector('#loansTableBody');
const formMessage = document.querySelector('#formMessage');

function setMessage(message, type = '') {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`.trim();
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderLoans(loans) {
  if (!loans.length) {
    loansTableBody.innerHTML = '<tr><td colspan="5">Todavia no hay prestamos registrados.</td></tr>';
    return;
  }

  loansTableBody.innerHTML = loans.map((loan) => `
    <tr>
      <td>${escapeHtml(loan.student)}</td>
      <td>${escapeHtml(loan.book)}</td>
      <td>${escapeHtml(formatDate(loan.date))}</td>
      <td><span class="badge ${loan.status === 'Devuelto' ? 'badge-returned' : 'badge-borrowed'}">${escapeHtml(loan.status)}</span></td>
      <td>
        ${loan.status === 'Devuelto'
          ? '<span class="returned-text">Ya regresado</span>'
          : `<button class="return-button" type="button" data-loan-id="${escapeHtml(loan._id)}">Marcar devuelto</button>`}
      </td>
    </tr>
  `).join('');
}

async function loadLoans() {
  try {
    const response = await fetch('/api/loans');
    if (!response.ok) {
      throw new Error('No se pudieron cargar los prestamos.');
    }

    const loans = await response.json();
    renderLoans(loans);
  } catch (error) {
    loansTableBody.innerHTML = '<tr><td colspan="5">No se pudo conectar con el servidor.</td></tr>';
    setMessage(error.message, 'error');
  }
}

async function markAsReturned(loanId, button) {
  button.disabled = true;
  button.textContent = 'Guardando...';
  setMessage('Actualizando prestamo...');

  try {
    const response = await fetch(`/api/loans/${loanId}/return`, {
      method: 'PATCH'
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'No se pudo actualizar el prestamo.');
    }

    setMessage('Prestamo marcado como devuelto.', 'success');
    await loadLoans();
  } catch (error) {
    setMessage(error.message, 'error');
    button.disabled = false;
    button.textContent = 'Marcar devuelto';
  }
}

loansTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('.return-button');
  if (!button) {
    return;
  }

  markAsReturned(button.dataset.loanId, button);
});

loanForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = loanForm.querySelector('button[type="submit"]');
  const formData = new FormData(loanForm);
  const payload = {
    student: formData.get('student').trim(),
    book: formData.get('book').trim(),
    date: formData.get('date')
  };

  submitButton.disabled = true;
  setMessage('Guardando prestamo...');

  try {
    const response = await fetch('/api/loans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'No se pudo guardar el prestamo.');
    }

    loanForm.reset();
    setMessage('Prestamo guardado correctamente.', 'success');
    await loadLoans();
  } catch (error) {
    setMessage(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

loadLoans();
