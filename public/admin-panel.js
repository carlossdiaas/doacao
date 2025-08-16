const API = (window.location.hostname === 'localhost') ? 'http://localhost:4000' : 'https://YOUR_BACKEND_URL';

// Verificar se é admin
function checkAdminAuth() {
  const isAdmin = localStorage.getItem('isAdmin');
  const adminToken = localStorage.getItem('adminToken');
  
  if (!isAdmin || !adminToken) {
    window.location.href = '/admin-login.html';
    return false;
  }
  return true;
}

// Função para mostrar loading
function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('donations-table').classList.add('hidden');
  document.getElementById('no-donations').classList.add('hidden');
}

// Função para esconder loading
function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('donations-table').classList.remove('hidden');
}

// Função para formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full`;
  
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  notification.className += ` ${colors[type]}`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-3"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-75">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Função para atualizar estatísticas
function updateStats(donations) {
  const totalDonations = donations.length;
  const cities = new Set(donations.map(d => d.city || d.owner_city).filter(city => city));
  const today = new Date().toDateString();
  const todayDonations = donations.filter(d => new Date(d.created_at).toDateString() === today).length;
  
  // Estimativa de usuários (baseada no número de doadores únicos)
  const uniqueDonors = new Set(donations.map(d => d.owner_id || d.owner_name)).size;
  
  document.getElementById('total-donations').textContent = totalDonations;
  document.getElementById('total-users').textContent = uniqueDonors;
  document.getElementById('cities-served').textContent = cities.size;
  document.getElementById('today-donations').textContent = todayDonations;
}

// Função para renderizar doações na tabela
function renderDonationsTable(donations) {
  const tbody = document.getElementById('donations-tbody');
  
  if (donations.length === 0) {
    document.getElementById('no-donations').classList.remove('hidden');
    document.getElementById('donations-table').classList.add('hidden');
    document.getElementById('donations-count').textContent = '0';
    return;
  }
  
  document.getElementById('no-donations').classList.add('hidden');
  document.getElementById('donations-table').classList.remove('hidden');
  document.getElementById('donations-count').textContent = donations.length;
  
  tbody.innerHTML = '';
  
  donations.forEach(donation => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    const img = donation.image_path 
      ? `<img src="${API}/${donation.image_path.replace(/^\./,'').replace(/^\\/,'')}" class="w-12 h-12 object-cover rounded-lg" alt="${donation.title}" />` 
      : `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <i class="fas fa-image text-gray-400"></i>
         </div>`;
    
    row.innerHTML = `
      <td class="px-4 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            ${img}
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${donation.title}</div>
            <div class="text-sm text-gray-500">${donation.description || 'Sem descrição'}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${donation.owner_name}</div>
        <div class="text-sm text-gray-500">ID: ${donation.owner_id || 'N/A'}</div>
      </td>
      <td class="px-4 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${donation.city || donation.owner_city || 'Não informada'}</div>
      </td>
      <td class="px-4 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${formatDate(donation.created_at)}</div>
      </td>
      <td class="px-4 py-4 whitespace-nowrap">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Ativa
        </span>
      </td>
      <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <button onclick="viewDonation('${donation.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="deleteDonation('${donation.id}', '${donation.title.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-900">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Função para carregar doações
async function loadDonations() {
  try {
    showLoading();
    
    const res = await fetch(API + '/donations');
    if (!res.ok) throw new Error('Erro ao carregar doações');
    
    const data = await res.json();
    
    hideLoading();
    
    if (!data.donations || data.donations.length === 0) {
      document.getElementById('no-donations').classList.remove('hidden');
      document.getElementById('donations-table').classList.add('hidden');
      updateStats([]);
      return;
    }
    
    // Atualizar estatísticas
    updateStats(data.donations);
    
    // Renderizar tabela
    renderDonationsTable(data.donations);
    
  } catch (error) {
    hideLoading();
    showNotification('Erro ao carregar doações: ' + error.message, 'error');
  }
}

// Função para visualizar doação
function viewDonation(id) {
  showNotification('Funcionalidade de visualização em desenvolvimento', 'info');
}

// Função para visualizar doação
function viewDonation(id) {
  showNotification('Funcionalidade de visualização em desenvolvimento', 'info');
}

// Função para deletar doação
function deleteDonation(id, title) {
  console.log('Função deleteDonation chamada com:', id, title);
  
  // Converter ID para string se necessário
  const donationId = String(id);
  
  // Mostrar modal de confirmação
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('hidden');
  
  // Configurar botão de confirmação
  const confirmBtn = document.getElementById('btn-confirm-delete');
  confirmBtn.onclick = async () => {
    console.log('Botão confirmar clicado');
    
    try {
      // Mostrar loading no botão
      const originalText = confirmBtn.innerHTML;
      confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Excluindo...';
      confirmBtn.disabled = true;
      
      const adminToken = localStorage.getItem('adminToken');
      console.log('Token do admin:', adminToken);
      console.log('URL da API:', API + `/donations/${donationId}`);
      
      const res = await fetch(API + `/donations/${donationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + adminToken
        }
      });
      
      console.log('Status da resposta:', res.status);
      console.log('Status text:', res.statusText);
      
      if (res.ok) {
        console.log('Sucesso! Doação excluída');
        showNotification(`Doação "${title}" excluída com sucesso!`, 'success');
        modal.classList.add('hidden');
        loadDonations(); // Recarregar lista
      } else {
        const data = await res.json();
        console.log('Erro do servidor:', data);
        showNotification('Erro ao excluir doação: ' + (data.error || 'Erro desconhecido'), 'error');
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
      showNotification('Erro ao excluir doação: ' + error.message, 'error');
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
    }
  };
}

// Função para fazer logout
function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAdmin');
  window.location.href = '/admin-login.html';
}

// Função para buscar doações
function searchDonations() {
  const searchTerm = document.getElementById('search-donations').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  
  // Implementar busca e filtros aqui
  showNotification('Funcionalidade de busca em desenvolvimento', 'info');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticação
  if (!checkAdminAuth()) return;
  
  // Carregar doações iniciais
  loadDonations();
  
  // Botão de atualizar
  document.getElementById('btn-refresh').addEventListener('click', loadDonations);
  
  // Botão de logout
  document.getElementById('btn-logout').addEventListener('click', logout);
  
  // Botão de busca
  document.getElementById('btn-search').addEventListener('click', searchDonations);
  
  // Cancelar exclusão
  document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    document.getElementById('delete-modal').classList.add('hidden');
  });
  
  // Busca por Enter
  document.getElementById('search-donations').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchDonations();
    }
  });
  
  // Filtro de status
  document.getElementById('filter-status').addEventListener('change', searchDonations);
});
