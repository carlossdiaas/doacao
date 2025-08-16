const API = (window.location.hostname === 'localhost') ? 'http://localhost:4000' : 'https://YOUR_BACKEND_URL';

// Variáveis globais para filtros
let allDonations = [];
let filteredDonations = [];
let currentFilters = {
  category: '',
  city: '',
  sort: 'newest'
};

// Função para mostrar loading
function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('donations-list').innerHTML = '';
  document.getElementById('no-donations').classList.add('hidden');
}

// Função para esconder loading
function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

// Função para mostrar mensagem de erro
function showError(message) {
  const list = document.getElementById('donations-list');
  list.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-8">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h3 class="text-xl font-semibold text-red-700 mb-2">Erro ao carregar doações</h3>
        <p class="text-red-600 mb-4">${message}</p>
        <button onclick="fetchDonations()" class="bg-red-600 hover:bg-red-700 px-6 py-3 text-white rounded-full font-semibold transition-all duration-300">
          <i class="fas fa-redo mr-2"></i>Tentar Novamente
        </button>
      </div>
    </div>
  `;
}

// Função para atualizar estatísticas
function updateStats(donations) {
  const totalDonations = donations.length;
  const cities = new Set(donations.map(d => d.city || d.owner_city).filter(city => city));
  const peopleHelped = Math.floor(totalDonations * 0.8); // Estimativa

  document.getElementById('total-donations').textContent = totalDonations;
  document.getElementById('people-helped').textContent = peopleHelped;
  document.getElementById('cities-served').textContent = cities.size;
}

// Função para formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Função para detectar categoria baseada no título
function detectCategory(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('livro') || lowerTitle.includes('book') || lowerTitle.includes('revista')) return 'livros';
  if (lowerTitle.includes('roupa') || lowerTitle.includes('camisa') || lowerTitle.includes('calça') || lowerTitle.includes('vestido')) return 'roupas';
  if (lowerTitle.includes('celular') || lowerTitle.includes('computador') || lowerTitle.includes('tv') || lowerTitle.includes('notebook')) return 'eletronicos';
  if (lowerTitle.includes('mesa') || lowerTitle.includes('cadeira') || lowerTitle.includes('sofa') || lowerTitle.includes('armario')) return 'moveis';
  if (lowerTitle.includes('brinquedo') || lowerTitle.includes('boneca') || lowerTitle.includes('carrinho')) return 'brinquedos';
  if (lowerTitle.includes('bola') || lowerTitle.includes('raquete') || lowerTitle.includes('bicicleta')) return 'esportes';
  return 'outros';
}

// Função para aplicar filtros
function applyFilters() {
  filteredDonations = allDonations.filter(donation => {
    const category = detectCategory(donation.title);
    const city = donation.city || donation.owner_city || '';
    
    // Filtro por categoria
    if (currentFilters.category && category !== currentFilters.category) {
      return false;
    }
    
    // Filtro por cidade
    if (currentFilters.city && !city.toLowerCase().includes(currentFilters.city.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Aplicar ordenação
  sortDonations();
  
  // Atualizar estatísticas
  updateStats(filteredDonations);
  
  // Renderizar doações filtradas
  renderDonations();
  
  // Atualizar filtros ativos
  updateActiveFilters();
}

// Função para ordenar doações
function sortDonations() {
  switch (currentFilters.sort) {
    case 'newest':
      filteredDonations.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      break;
    case 'oldest':
      filteredDonations.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      break;
    case 'title':
      filteredDonations.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'city':
      filteredDonations.sort((a, b) => (a.city || a.owner_city || '').localeCompare(b.city || b.owner_city || ''));
      break;
  }
}

// Função para atualizar filtros ativos
function updateActiveFilters() {
  const activeFilters = document.getElementById('active-filters');
  const hasActiveFilters = currentFilters.category || currentFilters.city;
  
  if (hasActiveFilters) {
    activeFilters.classList.remove('hidden');
    
    if (currentFilters.category) {
      const categoryText = document.getElementById('filter-category').options[document.getElementById('filter-category').selectedIndex].text;
      document.getElementById('active-category-text').textContent = `Categoria: ${categoryText}`;
    }
    
    if (currentFilters.city) {
      document.getElementById('active-city-text').textContent = `Cidade: ${currentFilters.city}`;
    }
  } else {
    activeFilters.classList.add('hidden');
  }
}

// Função para remover filtro
function removeFilter(type) {
  if (type === 'category') {
    currentFilters.category = '';
    document.getElementById('filter-category').value = '';
  } else if (type === 'city') {
    currentFilters.city = '';
    document.getElementById('filter-city').value = '';
  }
  applyFilters();
}

// Função para limpar todos os filtros
function clearAllFilters() {
  currentFilters = {
    category: '',
    city: '',
    sort: 'newest'
  };
  
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-city').value = '';
  document.getElementById('filter-sort').value = 'newest';
  
  applyFilters();
}

// Função para renderizar doações
function renderDonations() {
  const list = document.getElementById('donations-list');
  
  if (filteredDonations.length === 0) {
    document.getElementById('no-donations').classList.remove('hidden');
    return;
  }
  
  document.getElementById('no-donations').classList.add('hidden');
  
  list.innerHTML = '';
  filteredDonations.forEach(d => {
    const img = d.image_path 
      ? `<img src="${API}/${d.image_path.replace(/^\./,'').replace(/^\\/,'')}" class="w-full h-48 object-cover rounded-t-2xl" alt="${d.title}" />` 
      : `<div class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl flex items-center justify-center">
          <i class="fas fa-image text-4xl text-gray-400"></i>
         </div>`;
    
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-lg overflow-hidden card-hover';
    card.innerHTML = `
      ${img}
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-xl font-bold text-gray-800 line-clamp-2">${d.title}</h3>
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">Disponível</span>
        </div>
        <p class="text-gray-600 mb-4 line-clamp-3">${d.description || 'Sem descrição disponível'}</p>
        
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-500">
            <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
            <span>${d.city || d.owner_city || 'Localização não informada'}</span>
          </div>
          <div class="flex items-center text-sm text-gray-500">
            <i class="fas fa-user text-purple-500 mr-2"></i>
            <span>Doado por: ${d.owner_name}</span>
          </div>
          <div class="flex items-center text-sm text-gray-500">
            <i class="fas fa-calendar text-orange-500 mr-2"></i>
            <span>${formatDate(d.created_at || new Date())}</span>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button data-id="${d.id}" class="claim-btn flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
            <i class="fas fa-heart mr-2"></i>Quero Esta Doação
          </button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
  
  // Adicionar eventos aos botões
  document.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Faça login para solicitar doações', 'warning');
        return;
      }
      
      const donationId = e.target.closest('.claim-btn').dataset.id;
      const button = e.target.closest('.claim-btn');
      const originalText = button.innerHTML;
      
      // Mostrar loading no botão
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Solicitando...';
      button.disabled = true;
      
      try {
        const res = await fetch(API + '/claim', { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + token 
          }, 
          body: JSON.stringify({ donation_id: donationId }) 
        });
        
        const data = await res.json();
        
        if (data.success) {
          showNotification('Solicitação registrada com sucesso!', 'success');
          button.innerHTML = '<i class="fas fa-check mr-2"></i>Solicitado';
          button.classList.remove('bg-gradient-to-r', 'from-green-500', 'to-green-600', 'hover:from-green-600', 'hover:to-green-700');
          button.classList.add('bg-gray-500');
          button.disabled = true;
        } else {
          showNotification('Erro: ' + (data.error || 'Erro desconhecido'), 'error');
          button.innerHTML = originalText;
          button.disabled = false;
        }
      } catch (error) {
        showNotification('Erro ao processar solicitação', 'error');
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
    });
}

async function fetchDonations() {
  try {
    showLoading();
    
    const res = await fetch(API + '/donations');
    if (!res.ok) throw new Error('Erro ao carregar doações');
    
    const data = await res.json();
    
    hideLoading();
    
    if (!data.donations || data.donations.length === 0) {
      document.getElementById('no-donations').classList.remove('hidden');
      return;
    }
    
    // Armazenar todas as doações
    allDonations = data.donations;
    filteredDonations = [...allDonations];
    
    // Aplicar filtros iniciais
    applyFilters();
    
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
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
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remover após 5 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Verificar se o usuário está logado
function checkUserAuth() {
  const token = localStorage.getItem('token');
  const btnLogin = document.getElementById('btn-login');
  const btnProfile = document.getElementById('btn-profile');
  const btnLogout = document.getElementById('btn-logout');
  const userWelcome = document.getElementById('user-welcome');
  
  if (token) {
    btnLogin?.classList.add('hidden');
    btnProfile?.classList.remove('hidden');
    btnLogout?.classList.remove('hidden');
    userWelcome?.classList.remove('hidden');
    
    // Carregar informações do usuário
    loadUserInfo();
  } else {
    btnLogin?.classList.remove('hidden');
    btnProfile?.classList.add('hidden');
    btnLogout?.classList.add('hidden');
    userWelcome?.classList.add('hidden');
  }
}

// Função para carregar informações do usuário
async function loadUserInfo() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (res.ok) {
      const data = await res.json();
      
      if (data.user) {
        // Atualizar nome do usuário
        const userName = document.getElementById('user-name');
        if (userName) {
          userName.textContent = data.user.name || 'Usuário';
        }
        
        // Atualizar foto de perfil
        const userProfileImage = document.getElementById('user-profile-image');
        const defaultUserIcon = document.getElementById('default-user-icon');
        
        if (data.user.profile_photo && userProfileImage && defaultUserIcon) {
          userProfileImage.src = API + '/' + data.user.profile_photo;
          userProfileImage.classList.remove('hidden');
          defaultUserIcon.classList.add('hidden');
        }
      }
    }
  } catch (error) {
    console.log('Erro ao carregar informações do usuário:', error);
  }
}

// Botões de navegação
document.getElementById('btn-login')?.addEventListener('click', () => {
  window.location.href = '/login.html';
});
document.getElementById('btn-profile')?.addEventListener('click', () => {
  window.location.href = '/profile.html';
});
document.getElementById('btn-logout')?.addEventListener('click', () => {
  // Limpar dados do localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Mostrar notificação
  showNotification('Logout realizado com sucesso!', 'success');
  
  // Recarregar a página para atualizar a interface
  setTimeout(() => {
    window.location.reload();
  }, 1000);
});
document.getElementById('btn-new-donation')?.addEventListener('click', () => {
  window.location.href = '/new-donation.html';
});
document.getElementById('btn-first-donation')?.addEventListener('click', () => {
  window.location.href = '/new-donation.html';
});
document.getElementById('btn-admin')?.addEventListener('click', () => {
  window.location.href = '/admin-login.html';
});

// Eventos dos filtros
document.getElementById('filter-category')?.addEventListener('change', (e) => {
  currentFilters.category = e.target.value;
  applyFilters();
});

document.getElementById('filter-city')?.addEventListener('input', (e) => {
  currentFilters.city = e.target.value;
  applyFilters();
});

document.getElementById('filter-sort')?.addEventListener('change', (e) => {
  currentFilters.sort = e.target.value;
  applyFilters();
});

document.getElementById('search-btn')?.addEventListener('click', () => {
  applyFilters();
});

document.getElementById('clear-filters')?.addEventListener('click', () => {
  clearAllFilters();
});

// Inicializar a aplicação
checkUserAuth(); // Verificar autenticação do usuário
fetchDonations();

// Atualizar informações do usuário quando a página voltar a ter foco
window.addEventListener('focus', () => {
  if (localStorage.getItem('token')) {
    loadUserInfo();
  }
});
