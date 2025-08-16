const API = (window.location.hostname === 'localhost') ? 'http://localhost:4000' : 'https://YOUR_BACKEND_URL';

// Verificar se o usuário está logado
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
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

// Função para mostrar/esconder loading
function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
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

// Função para carregar dados do perfil
async function loadProfile() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!res.ok) throw new Error('Erro ao carregar perfil');
    
    const data = await res.json();
    
    if (data.user) {
      // Preencher formulário
      document.getElementById('name').value = data.user.name || '';
      document.getElementById('email').value = data.user.email || '';
      document.getElementById('phone').value = data.user.phone || '';
      document.getElementById('city').value = data.user.city || '';
      document.getElementById('bio').value = data.user.bio || '';
      
      // Carregar foto de perfil
      if (data.user.profile_photo) {
        const profileImage = document.getElementById('profile-image');
        const defaultAvatar = document.getElementById('default-avatar');
        
        profileImage.src = API + '/' + data.user.profile_photo;
        profileImage.classList.remove('hidden');
        defaultAvatar.classList.add('hidden');
      }
      
      // Carregar estatísticas
      loadUserStats();
    }
  } catch (error) {
    showNotification('Erro ao carregar perfil: ' + error.message, 'error');
  }
}

// Função para carregar estatísticas do usuário
async function loadUserStats() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/user/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (res.ok) {
      const data = await res.json();
      
      document.getElementById('donations-count').textContent = data.donations_count || 0;
      document.getElementById('people-helped').textContent = data.people_helped || 0;
      document.getElementById('member-since').textContent = data.member_since ? formatDate(data.member_since) : '-';
    }
  } catch (error) {
    console.log('Erro ao carregar estatísticas:', error);
  }
}

// Função para preview da foto de perfil
function setupPhotoPreview() {
  const fileInput = document.getElementById('profile-photo');
  const profileImage = document.getElementById('profile-image');
  const defaultAvatar = document.getElementById('default-avatar');
  
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 5MB', 'error');
        return;
      }
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = function(e) {
        profileImage.src = e.target.result;
        profileImage.classList.remove('hidden');
        defaultAvatar.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });
}

// Função para salvar perfil
async function saveProfile(formData) {
  try {
    showLoading();
    
    const token = localStorage.getItem('token');
    const res = await fetch(API + '/profile', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    
    hideLoading();
    
    if (res.ok) {
      const data = await res.json();
      showNotification('Perfil atualizado com sucesso!', 'success');
      
      // Atualizar foto se foi enviada
      if (data.user && data.user.profile_photo) {
        const profileImage = document.getElementById('profile-image');
        const defaultAvatar = document.getElementById('default-avatar');
        
        profileImage.src = API + '/' + data.user.profile_photo;
        profileImage.classList.remove('hidden');
        defaultAvatar.classList.add('hidden');
      }
    } else {
      const errorData = await res.json();
      showNotification('Erro ao atualizar perfil: ' + (errorData.error || 'Erro desconhecido'), 'error');
    }
  } catch (error) {
    hideLoading();
    showNotification('Erro ao atualizar perfil: ' + error.message, 'error');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticação
  if (!checkAuth()) return;
  
  // Carregar perfil
  loadProfile();
  
  // Configurar preview de foto
  setupPhotoPreview();
  
  // Formulário de perfil
  document.getElementById('profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    // Validar campos obrigatórios
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    
    if (!name) {
      showNotification('Nome é obrigatório', 'error');
      return;
    }
    
    if (!email) {
      showNotification('E-mail é obrigatório', 'error');
      return;
    }
    
    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('E-mail inválido', 'error');
      return;
    }
    
    await saveProfile(formData);
  });
  
  // Botão cancelar
  document.getElementById('btn-cancel').addEventListener('click', function() {
    window.location.href = '/';
  });
});
