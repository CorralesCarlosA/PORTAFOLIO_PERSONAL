import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';

const API_URL = 'http://127.0.0.1:8000';

export default function App() {
  // Estado del Perfil
  const [profile, setProfile] = useState(null);

  // Estado de Proyectos, Ideas y Categorías
  const [projects, setProjects] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [adminProjects, setAdminProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // Proyecto o Idea en modal
  const [loading, setLoading] = useState(true);

  // Modales
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState('projects'); // 'projects' | 'ideas' | 'profile' | 'categories' | 'messages'

  // Auth & Admin State
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('Berbeny');
  const [password, setPassword] = useState('Solo12!!');

  // Formulario Edición de Perfil (Admin)
  const [editFullName, setEditFullName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCareerStartYear, setEditCareerStartYear] = useState('2021');
  const [editExperienceYears, setEditExperienceYears] = useState('5');
  const [editSkills, setEditSkills] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Formulario Nuevo Proyecto (Admin)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRepo, setNewRepo] = useState('');
  const [newDoc, setNewDoc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCatId, setNewCatId] = useState(1);

  // Formulario Nueva Idea de Desarrollo (Admin)
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaDoc, setNewIdeaDoc] = useState('');
  const [newIdeaRepo, setNewIdeaRepo] = useState('');
  const [newIdeaImageUrl, setNewIdeaImageUrl] = useState('');
  const [newIdeaCatId, setNewIdeaCatId] = useState(1);

  // Estado Edición de Proyecto / Idea Existente
  const [editingItem, setEditingItem] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemDesc, setEditItemDesc] = useState('');
  const [editItemRepo, setEditItemRepo] = useState('');
  const [editItemDoc, setEditItemDoc] = useState('');
  const [editItemImageUrl, setEditItemImageUrl] = useState('');
  const [editItemCatId, setEditItemCatId] = useState(1);
  const [editItemIsIdea, setEditItemIsIdea] = useState(false);

  // Formulario Nuevas Categorías (Admin)
  const [newCategoryName, setNewCategoryName] = useState('');

  // Mensajes Privados (Admin)
  const [messages, setMessages] = useState([]);

  // Votaciones ya realizadas en esta sesión (localStorage)
  const [votedItems, setVotedItems] = useState(() => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('portfolio_voted_items');
        return stored ? JSON.parse(stored) : [];
      }
    } catch (_) { }
    return [];
  });

  // Formulario Comentarios y Contacto
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgText, setMsgText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchProjects(), fetchIdeas(), fetchCategories()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditFullName(data.full_name || '');
        setEditHeadline(data.headline || '');
        setEditBio(data.bio || '');
        setEditIsAvailable(data.is_available ?? true);
        setEditEmail(data.email || '');
        setEditPhone(data.phone || '');
        setEditLinkedin(data.linkedin_url || '');
        setEditGithub(data.github_url || '');
        setEditLocation(data.location || '');
        setEditCareerStartYear((data.career_start_year || 2021).toString());
        setEditExperienceYears((data.experience_years || 5).toString());
        setEditSkills(data.skills || '');
        setEditAvatarUrl(data.avatar_url || '');
        setAvatarPreview(data.avatar_url || '');
      }
    } catch (e) {
      console.error("Error al cargar perfil desde BD:", e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Error al cargar proyectos:", e);
    }
  };

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`${API_URL}/ideas`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (e) {
      console.error("Error al cargar ideas:", e);
    }
  };

  const fetchAdminProjects = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminProjects(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) {
          setNewCatId(data[0].id);
          setNewIdeaCatId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Error al cargar categorías:", e);
    }
  };

  const fetchAdminMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Votación (para proyectos e ideas) — con bloqueo por sesión vía localStorage
  const handleVote = async (itemId) => {
    if (votedItems.includes(itemId)) {
      showToast("Ya has valorado esta idea. Vuelve en tu próxima visita.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/projects/${itemId}/vote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === itemId ? { ...p, votes_count: data.votes } : p));
        setIdeas(prev => prev.map(i => i.id === itemId ? { ...i, votes_count: data.votes } : i));
        if (selectedItem && selectedItem.id === itemId) {
          setSelectedItem(prev => ({ ...prev, votes_count: data.votes }));
        }
        // Registrar voto en localStorage para bloquear hasta nueva visita
        const newVoted = [...votedItems, itemId];
        setVotedItems(newVoted);
        try {
          if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
            localStorage.setItem('portfolio_voted_items', JSON.stringify(newVoted));
          }
        } catch (_) { }
        showToast("Valoración registrada. ¡Gracias por tu apoyo!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Comentarios (para proyectos e ideas)
  const handleComment = async () => {
    if (!commentAuthor.trim() || !commentText.trim()) {
      alert("Por favor completa tu nombre y comentario.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('author', commentAuthor);
      formData.append('content', commentText);

      const res = await fetch(`${API_URL}/projects/${selectedItem.id}/comment`, { method: 'POST', body: formData });
      if (res.ok) {
        const newComment = { id: Date.now(), author: commentAuthor, content: commentText };
        setSelectedItem(prev => ({
          ...prev,
          comments: [...(prev.comments || []), newComment]
        }));
        fetchProjects();
        fetchIdeas();
        setCommentAuthor('');
        setCommentText('');
        showToast("Comentario publicado exitosamente");
      }
    } catch (e) {
      alert("Error al enviar comentario");
    }
  };

  // Mensaje Privado
  const handlePrivateMsg = async () => {
    if (!msgEmail.trim() || !msgText.trim()) {
      alert("Ingresa tu email y el mensaje.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('sender_email', msgEmail);
      formData.append('message', msgText);

      const res = await fetch(`${API_URL}/projects/${selectedItem.id}/message`, { method: 'POST', body: formData });
      if (res.ok) {
        setMsgEmail('');
        setMsgText('');
        showToast("Mensaje enviado directamente al desarrollador");
      }
    } catch (e) {
      alert("Error al enviar mensaje");
    }
  };

  // Autenticación Administrador
  const handleLogin = async () => {
    if (!username || !password) {
      alert("Ingresa usuario y contraseña.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch(`${API_URL}/token`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        showToast("Sesión administrativa iniciada correctamente");
        setTimeout(() => {
          fetchAdminProjects();
          fetchAdminMessages();
        }, 200);
      } else {
        alert("Usuario o contraseña incorrectos.");
      }
    } catch (e) {
      alert("Error al conectar con el servidor.");
    }
  };

  // Subida de imagen desde archivo local (Web)
  const handlePickLocalImage = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
          showToast("Imagen seleccionada. Presiona 'Guardar Perfil' para aplicar.");
        }
      };
      input.click();
    } else {
      alert("Copia y pega la URL directa de la imagen en el campo correspondiente.");
    }
  };

  // Admin: Actualizar Perfil
  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('full_name', editFullName);
      formData.append('headline', editHeadline);
      formData.append('bio', editBio);
      formData.append('is_available', editIsAvailable ? 'true' : 'false');
      formData.append('email', editEmail);
      formData.append('phone', editPhone);
      formData.append('linkedin_url', editLinkedin);
      formData.append('github_url', editGithub);
      formData.append('location', editLocation);
      formData.append('career_start_year', editCareerStartYear);
      formData.append('experience_years', editExperienceYears);
      formData.append('skills', editSkills);

      if (editAvatarUrl.trim()) {
        formData.append('avatar_url', editAvatarUrl.trim());
      }
      if (selectedAvatarFile) {
        formData.append('avatar', selectedAvatarFile);
      }

      const res = await fetch(`${API_URL}/admin/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSelectedAvatarFile(null);
        showToast("Perfil, habilidades y cartelera guardados en la base de datos");
      } else {
        alert("Error al guardar perfil.");
      }
    } catch (e) {
      alert("Error al guardar perfil.");
    }
  };

  // Admin: Crear Proyecto
  const handleCreateProject = async () => {
    if (!newTitle || !newDesc) {
      alert("Completa el título y descripción del proyecto.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDesc);
      formData.append('repository_url', newRepo || 'https://github.com/');
      formData.append('problem_document', newDoc);
      formData.append('image_url', newImageUrl || '');
      formData.append('category_id', newCatId);
      formData.append('is_active', 'true');
      formData.append('is_idea', 'false');

      const res = await fetch(`${API_URL}/admin/projects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setNewTitle(''); setNewDesc(''); setNewRepo(''); setNewDoc(''); setNewImageUrl('');
        fetchProjects();
        fetchAdminProjects();
        showToast("Proyecto registrado exitosamente");
      }
    } catch (e) {
      alert("Error al crear proyecto.");
    }
  };

  // Admin: Crear Idea de Desarrollo
  const handleCreateIdea = async () => {
    if (!newIdeaTitle || !newIdeaDesc) {
      alert("Completa el título y la descripción de la idea.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', newIdeaTitle);
      formData.append('description', newIdeaDesc);
      formData.append('repository_url', newIdeaRepo || '');
      formData.append('problem_document', newIdeaDoc);
      formData.append('image_url', newIdeaImageUrl || '');
      formData.append('category_id', newIdeaCatId);
      formData.append('is_active', 'true');
      formData.append('is_idea', 'true');

      const res = await fetch(`${API_URL}/admin/projects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setNewIdeaTitle(''); setNewIdeaDesc(''); setNewIdeaRepo(''); setNewIdeaDoc(''); setNewIdeaImageUrl('');
        fetchIdeas();
        fetchAdminProjects();
        showToast("Idea de desarrollo agregada al laboratorio");
      }
    } catch (e) {
      alert("Error al crear idea.");
    }
  };

  // Admin: Abrir Edición de Proyecto o Idea
  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditItemTitle(item.title || '');
    setEditItemDesc(item.description || '');
    setEditItemRepo(item.repository_url || '');
    setEditItemDoc(item.problem_document || '');
    setEditItemImageUrl(item.image_url || '');
    setEditItemCatId(item.category_id || 1);
    setEditItemIsIdea(item.is_idea || false);
  };

  // Admin: Guardar Edición de Proyecto o Idea
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const formData = new FormData();
      formData.append('title', editItemTitle);
      formData.append('description', editItemDesc);
      formData.append('repository_url', editItemRepo);
      formData.append('problem_document', editItemDoc);
      formData.append('image_url', editItemImageUrl || '');
      formData.append('category_id', editItemCatId);
      formData.append('is_active', editingItem.is_active ? 'true' : 'false');
      formData.append('is_idea', editItemIsIdea ? 'true' : 'false');

      const res = await fetch(`${API_URL}/admin/projects/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setEditingItem(null);
        fetchProjects();
        fetchIdeas();
        fetchAdminProjects();
        showToast("Elemento actualizado correctamente en la base de datos");
      }
    } catch (e) {
      alert("Error al actualizar.");
    }
  };

  // Admin: Toggle Estado (Activar / Desactivar)
  const handleToggleProjectStatus = async (projectId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('is_active', (!currentStatus).toString());

      const res = await fetch(`${API_URL}/admin/projects/${projectId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchProjects();
        fetchIdeas();
        fetchAdminProjects();
        showToast(!currentStatus ? "Elemento activado y visible públicamente" : "Elemento desactivado");
      }
    } catch (e) {
      alert("Error al cambiar estado.");
    }
  };

  // Admin: Eliminar Proyecto o Idea
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro de la base de datos?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProjects();
        fetchIdeas();
        fetchAdminProjects();
        showToast("Registro eliminado de la base de datos");
      }
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  // Admin: Crear Categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const formData = new FormData();
      formData.append('name', newCategoryName);

      const res = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setNewCategoryName('');
        fetchCategories();
        showToast("Categoría agregada correctamente");
      }
    } catch (e) {
      alert("Error al agregar categoría.");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtro de proyectos
  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === 0 || p.category_id === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cálculo dinámico de años de experiencia
  const currentYear = new Date().getFullYear();
  const calculatedExperienceYears = profile?.career_start_year
    ? Math.max(1, currentYear - profile.career_start_year)
    : (profile?.experience_years || 5);

  const formattedAvatar = avatarPreview || (profile?.avatar_url?.startsWith('http')
    ? profile.avatar_url
    : profile?.avatar_url
      ? `${API_URL}${profile.avatar_url}`
      : "https://github.com/CorralesCarlosA.png");

  // Lista de habilidades parsed — soporta formato "Nombre:Puntuación" y "Nombre"
  const skillsList = (profile?.skills || "Python:95, FastAPI:90, Django:80, APIs REST:92, PostgreSQL:85, SQLite:88, Docker:70, Git:87, Automatización IA:82, React Native:65, JavaScript:72")
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const parts = s.split(':');
      if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
        return { name: parts[0].trim(), score: Math.min(100, Math.max(0, parseInt(parts[1], 10))) };
      }
      return { name: s, score: null };
    });

  const adminRealProjects = adminProjects.filter(p => !p.is_idea);
  const adminIdeaProjects = adminProjects.filter(p => p.is_idea);

  return (
    <View style={styles.container}>
      {/* NOTIFICACIÓN TOAST LIMPIA */}
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* NAVBAR SUPERIOR EJECUTIVO (SIN FOTO REPETIDA NI REDUNDANCIA) */}
      <View style={styles.navbar}>
        <View style={styles.brandContainer}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>CD</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>{profile?.full_name || "Carlos Andrés Corrales Díaz"}</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: profile?.is_available ? '#10b981' : '#64748b' }]} />
              <Text style={styles.statusText}>
                {profile?.is_available ? "Disponible para nuevos proyectos" : "No disponible temporalmente"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.navLinks}>
          {profile?.github_url ? (
            <TouchableOpacity style={styles.socialNavBtn} onPress={() => Linking.openURL(profile.github_url)}>
              <Text style={styles.socialNavBtnText}>GitHub</Text>
            </TouchableOpacity>
          ) : null}

          {profile?.linkedin_url ? (
            <TouchableOpacity style={styles.socialNavBtn} onPress={() => Linking.openURL(profile.linkedin_url)}>
              <Text style={styles.socialNavBtnText}>LinkedIn</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ========================================================================= */}
        {/* PRIMER DIV GRANDE: CARTELERA DE EXPERIENCIA Y CAPACIDADES TÉCNICAS         */}
        {/* ========================================================================= */}
        <View style={styles.billboardContainer}>
          <View style={styles.billboardGrid}>

            {/* COLUMNA 1: FOTO EN MARCO DE CARTELERA PANORÁMICA */}
            <View style={styles.billboardPosterCol}>
              <View style={styles.billboardPosterFrame}>
                <Image
                  source={{ uri: formattedAvatar }}
                  style={styles.billboardPosterImage}
                  resizeMode="cover"
                />
                <View style={styles.billboardPosterOverlay}>
                  <Text style={styles.posterNameText}>{profile?.full_name || "Carlos Andrés Corrales Díaz"}</Text>
                  <Text style={styles.posterRoleText}>{profile?.headline ? profile.headline.split('|')[0].trim() : "Ingeniero de Sistemas"}</Text>
                  <View style={styles.locationPill}>
                    <Text style={styles.locationPillText}>{profile?.location || "Quibdó - Chocó - Colombia"}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* COLUMNA 2: EXPERIENCIA, CAPACIDADES Y PROPUESTA DE VALOR */}
            <View style={styles.billboardDetailsCol}>
              <View style={styles.sectionPillTag}>
                <Text style={styles.sectionPillTagText}>EXPERIENCIA Y CAPACIDADES PROFESIONALES</Text>
              </View>

              <Text style={styles.billboardMainTitle}>
                {profile?.headline || "Arquitectura de Software, Backend de Alto Rendimiento y Automatización IA"}
              </Text>

              <Text style={styles.billboardBioText}>
                {profile?.bio || "Especialista en desarrollo backend con Python, diseño y construcción de APIs RESTful de alto rendimiento, arquitecturas escalables, gestión de bases de datos relacionales y automatización inteligente con Inteligencia Artificial."}
              </Text>

              {/* TARJETA DESTACADA: CONTADOR DE AÑOS DE EXPERIENCIA */}
              <View style={styles.experienceMetricCard}>
                <View style={styles.experienceMetricHeader}>
                  <Text style={styles.experienceNumber}>+{calculatedExperienceYears}</Text>
                  <View style={styles.experienceLabelBox}>
                    <Text style={styles.experienceTitle}>Años de Experiencia Profesional</Text>
                    <Text style={styles.experienceSub}>
                      Trayectoria técnica continua desde el año {profile?.career_start_year || 2021}
                    </Text>
                  </View>
                </View>
                <Text style={styles.experienceDetailDescription}>
                  Experiencia sólida construyendo arquitecturas seguras, optimizando consultas de bases de datos y desarrollando APIs robustas listas para entornos de producción.
                </Text>
              </View>

              {/* ¿QUÉ PUEDO CONSTRUIR PARA TU EMPRESA? */}
              <View style={styles.capabilitiesBox}>
                <Text style={styles.capabilitiesHeader}>Soluciones y Capacidades Técnicas:</Text>
                <View style={styles.capabilitiesGrid}>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityDot}>•</Text>
                    <Text style={styles.capabilityText}>
                      <Text style={styles.capabilityBold}>Backend en Python (FastAPI / Django):</Text> Servicios asíncronos de baja latencia y alta concurrencia.
                    </Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityDot}>•</Text>
                    <Text style={styles.capabilityText}>
                      <Text style={styles.capabilityBold}>APIs RESTful Seguras:</Text> Autenticación JWT, documentación OpenAPI, validación estricta y arquitectura modular.
                    </Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityDot}>•</Text>
                    <Text style={styles.capabilityText}>
                      <Text style={styles.capabilityBold}>Bases de Datos Relacionales:</Text> Modelado y optimización en PostgreSQL y SQLite con ORM SQLAlchemy.
                    </Text>
                  </View>
                  <View style={styles.capabilityItem}>
                    <Text style={styles.capabilityDot}>•</Text>
                    <Text style={styles.capabilityText}>
                      <Text style={styles.capabilityBold}>Automatización con IA:</Text> Integración de agentes inteligentes, pipelines LLM y procesamiento de datos.
                    </Text>
                  </View>
                </View>
              </View>

              {/* BOTONES DE ACCIÓN DIRECTA */}
              <View style={styles.actionButtonsRow}>
                {profile?.email ? (
                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={() => Linking.openURL(`mailto:${profile.email}`)}
                  >
                    <Text style={styles.primaryActionBtnText}>Contactar por Correo</Text>
                  </TouchableOpacity>
                ) : null}

                {profile?.phone ? (
                  <TouchableOpacity
                    style={styles.secondaryActionBtn}
                    onPress={() => Linking.openURL(`tel:${profile.phone}`)}
                  >
                    <Text style={styles.secondaryActionBtnText}>Llamar: {profile.phone}</Text>
                  </TouchableOpacity>
                ) : null}

                {profile?.github_url ? (
                  <TouchableOpacity
                    style={styles.outlineActionBtn}
                    onPress={() => Linking.openURL(profile.github_url)}
                  >
                    <Text style={styles.outlineActionBtnText}>Ver Repositorios en GitHub</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: HABILIDADES TÉCNICAS & STACK TECNOLÓGICO                       */}
        {/* ========================================================================= */}
        <View style={styles.skillsSectionContainer}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.sectionHeading}>Habilidades Técnicas & Stack de Desarrollo</Text>
              <Text style={styles.sectionSubheading}>
                Tecnologías y herramientas que domino para construir software de producción
              </Text>
            </View>
          </View>

          <View style={styles.skillsChipsWrapper}>
            {skillsList.map((skill, index) => (
              <View key={index} style={styles.skillChipCard}>
                <View style={styles.skillChipTopRow}>
                  <View style={styles.skillChipAccent} />
                  <Text style={styles.skillChipLabel}>{skill.name}</Text>
                  {skill.score !== null ? (
                    <Text style={styles.skillChipScore}>{skill.score}%</Text>
                  ) : null}
                </View>
                {skill.score !== null ? (
                  <View style={styles.skillBarTrack}>
                    <View style={[
                      styles.skillBarFill,
                      {
                        width: `${skill.score}%`,
                        backgroundColor: skill.score >= 85
                          ? '#10b981'
                          : skill.score >= 70
                            ? '#38bdf8'
                            : '#f59e0b'
                      }
                    ]} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: IDEAS DE DESARROLLO (LABORATORIO & FEEDBACK COMUNITARIO)       */}
        {/* ========================================================================= */}
        <View style={styles.ideasSectionContainer}>
          <View style={styles.sectionTitleRow}>
            <View>
              <View style={styles.labBadge}>
                <Text style={styles.labBadgeText}>LABORATORIO DE INNOVACIÓN</Text>
              </View>
              <Text style={styles.sectionHeading}>Ideas de Desarrollo</Text>
              <Text style={styles.sectionSubheading}>
                Iniciativas y arquitecturas en fase de diseño. Apoya las propuestas con tu valoración y deja sugerencias para impulsarlas.
              </Text>
            </View>
          </View>

          {ideas.length === 0 ? (
            <View style={styles.emptyCardBox}>
              <Text style={styles.emptyTitleText}>No hay ideas de desarrollo publicadas actualmente</Text>
              <Text style={styles.emptySubtitleText}>
                Puedes publicar nuevas ideas desde el Panel de Control.
              </Text>
            </View>
          ) : (
            <View style={styles.ideasGrid}>
              {ideas.map((idea) => (
                <View key={idea.id} style={styles.ideaCard}>
                  <View style={styles.ideaCardHeader}>
                    <View style={styles.ideaTypeBadge}>
                      <Text style={styles.ideaTypeBadgeText}>Idea en Desarrollo</Text>
                    </View>
                    <View style={styles.ideaCategoryBadge}>
                      <Text style={styles.ideaCategoryBadgeText}>{idea.category_name || "Innovación"}</Text>
                    </View>
                  </View>

                  <Text style={styles.ideaTitle}>{idea.title}</Text>
                  <Text style={styles.ideaDesc} numberOfLines={3}>{idea.description}</Text>

                  {idea.problem_document ? (
                    <View style={styles.ideaVisionBox}>
                      <Text style={styles.ideaVisionHeading}>Objetivo & Visión Técnica:</Text>
                      <Text style={styles.ideaVisionText} numberOfLines={2}>{idea.problem_document}</Text>
                    </View>
                  ) : null}

                  <View style={styles.ideaCardFooter}>
                    <TouchableOpacity
                      style={[styles.voteIdeaBtn, votedItems.includes(idea.id) && styles.voteIdeaBtnVoted]}
                      onPress={() => handleVote(idea.id)}
                    >
                      <Text style={styles.voteIdeaBtnText}>
                        {votedItems.includes(idea.id) ? 'Valorado' : 'Valorar'} ({idea.votes_count || 0})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.commentIdeaBtn}
                      onPress={() => setSelectedItem(idea)}
                    >
                      <Text style={styles.commentIdeaBtnText}>
                        Comentarios ({idea.comments?.length || 0})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: PROYECTOS REALIZADOS & CÓDIGO FUENTE                           */}
        {/* ========================================================================= */}
        <View style={styles.projectsSectionContainer}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.sectionHeading}>Proyectos Realizados & Código Fuente</Text>
              <Text style={styles.sectionSubheading}>
                Sistemas construidos con arquitectura backend completa, documentación y pruebas
              </Text>
            </View>
          </View>

          {/* BÚSQUEDA Y CATEGORÍAS */}
          <View style={styles.filterBar}>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Buscar proyecto por título o descripción..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInputField}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 14 }}>Limpiar</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
              <TouchableOpacity
                style={[styles.categoryPillBtn, selectedCategory === 0 && styles.categoryPillBtnActive]}
                onPress={() => setSelectedCategory(0)}
              >
                <Text style={[styles.categoryPillText, selectedCategory === 0 && styles.categoryPillTextActive]}>
                  Todos ({projects.length})
                </Text>
              </TouchableOpacity>

              {categories.map(cat => {
                const count = projects.filter(p => p.category_id === cat.id).length;
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryPillBtn, isActive && styles.categoryPillBtnActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                      {cat.name} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#38bdf8" />
              <Text style={styles.loadingLabel}>Cargando proyectos desde la base de datos...</Text>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View style={styles.emptyCardBox}>
              <Text style={styles.emptyTitleText}>No se encontraron proyectos en esta categoría</Text>
              <Text style={styles.emptySubtitleText}>Prueba con otro filtro o consulta el Panel de Control.</Text>
            </View>
          ) : (
            <View style={styles.projectsGrid}>
              {filteredProjects.map((project) => (
                <View key={project.id} style={styles.projectCard}>
                  <View style={styles.cardCoverContainer}>
                    <Image
                      source={{
                        uri: project.image_url && project.image_url.trim().length > 0
                          ? project.image_url
                          : project.media && project.media.length > 0 && project.media[0].file_path.startsWith('http')
                            ? project.media[0].file_path
                            : project.media && project.media.length > 0
                              ? `${API_URL}${project.media[0].file_path}`
                              : "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                      }}
                      style={styles.cardCoverImage}
                      resizeMode="cover"
                    />
                    <View style={styles.cardCategoryPill}>
                      <Text style={styles.cardCategoryPillText}>{project.category_name || "General"}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBodyContent}>
                    <Text style={styles.cardTitleText}>{project.title}</Text>
                    <Text style={styles.cardDescriptionText} numberOfLines={3}>{project.description}</Text>

                    <View style={styles.cardTechWrapper}>
                      {(project.technologies || []).map((t, idx) => (
                        <View key={idx} style={styles.cardTechBadge}>
                          <Text style={styles.cardTechBadgeText}>{t.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.cardFooterActions}>
                    <TouchableOpacity
                      style={styles.voteCardBtn}
                      onPress={() => handleVote(project.id)}
                    >
                      <Text style={styles.voteCardBtnText}>Votos: {project.votes_count || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailCardBtn}
                      onPress={() => setSelectedItem(project)}
                    >
                      <Text style={styles.detailCardBtnText}>Ver Detalles</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* PUNTO OCULTO DE ACCESO AL PANEL DE ADMINISTRADOR */}
        <TouchableOpacity
          style={styles.hiddenAdminDot}
          onPress={() => {
            setShowAdminModal(true);
            if (token) {
              fetchAdminProjects();
              fetchAdminMessages();
            }
          }}
          activeOpacity={0.4}
        />

      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL: DETALLES DE PROYECTO O IDEA DE DESARROLLO                          */}
      {/* ========================================================================= */}
      {selectedItem && (
        <Modal animationType="fade" transparent={true} visible={true} onRequestClose={() => setSelectedItem(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View style={styles.modalTopNav}>
                  <View style={styles.modalBadgeRow}>
                    <View style={styles.modalItemCategoryBadge}>
                      <Text style={styles.modalItemCategoryBadgeText}>
                        {selectedItem.is_idea ? "Idea de Desarrollo" : (selectedItem.category_name || "Proyecto")}
                      </Text>
                    </View>
                    {selectedItem.is_idea ? (
                      <View style={[styles.modalItemCategoryBadge, { backgroundColor: '#3b82f6' }]}>
                        <Text style={styles.modalItemCategoryBadgeText}>En Fase de Diseño</Text>
                      </View>
                    ) : null}
                  </View>

                  <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closeBtnCircle}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>

                {(selectedItem.image_url || selectedItem.media?.[0]?.file_path) ? (
                  <Image
                    source={{
                      uri: selectedItem.image_url && selectedItem.image_url.trim().length > 0
                        ? selectedItem.image_url
                        : selectedItem.media && selectedItem.media.length > 0 && selectedItem.media[0].file_path.startsWith('http')
                          ? selectedItem.media[0].file_path
                          : `${API_URL}${selectedItem.media?.[0]?.file_path || ''}`
                    }}
                    style={styles.modalBannerImg}
                    resizeMode="cover"
                  />
                ) : null}

                <Text style={styles.modalContentHeading}>Descripción</Text>
                <Text style={styles.modalBodyParagraph}>{selectedItem.description}</Text>

                {selectedItem.problem_document ? (
                  <View style={styles.problemDocCard}>
                    <Text style={styles.problemDocHeading}>
                      {selectedItem.is_idea ? "Visión y Propuesta Técnica" : "Análisis del Problema & Solución"}
                    </Text>
                    <Text style={styles.problemDocBody}>{selectedItem.problem_document}</Text>
                  </View>
                ) : null}

                <View style={styles.modalInteractBar}>
                  {selectedItem.repository_url ? (
                    <TouchableOpacity
                      style={styles.repoBtn}
                      onPress={() => Linking.openURL(selectedItem.repository_url)}
                    >
                      <Text style={styles.repoBtnText}>Ver Repositorio en GitHub</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.voteModalBtn, votedItems.includes(selectedItem.id) && { opacity: 0.55 }]}
                    onPress={() => handleVote(selectedItem.id)}
                  >
                    <Text style={styles.voteModalBtnText}>
                      {votedItems.includes(selectedItem.id) ? 'Valorado' : 'Valorar'} ({selectedItem.votes_count || 0})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* COMENTARIOS PÚBLICOS */}
                <View style={styles.dividerLine} />
                <Text style={styles.modalContentHeading}>
                  Comentarios y Feedback ({selectedItem.comments?.length || 0})
                </Text>

                <View style={styles.commentsContainer}>
                  {(!selectedItem.comments || selectedItem.comments.length === 0) ? (
                    <Text style={styles.noCommentsNotice}>No hay comentarios aún. Deja tu mensaje de apoyo o recomendación técnica.</Text>
                  ) : (
                    selectedItem.comments.map((c, i) => (
                      <View key={i} style={styles.commentItemCard}>
                        <Text style={styles.commentAuthorName}>{c.author}</Text>
                        <Text style={styles.commentContentText}>{c.content}</Text>
                      </View>
                    ))
                  )}
                </View>

                {/* FORMULARIO COMENTARIO */}
                <View style={styles.commentFormCard}>
                  <Text style={styles.commentFormTitle}>Agregar Comentario / Sugerencia</Text>
                  <TextInput
                    placeholder="Tu Nombre o Empresa"
                    placeholderTextColor="#64748b"
                    value={commentAuthor}
                    onChangeText={setCommentAuthor}
                    style={styles.formInput}
                  />
                  <TextInput
                    placeholder="Escribe tu comentario o valoración técnica..."
                    placeholderTextColor="#64748b"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    style={[styles.formInput, { height: 75 }]}
                  />
                  <TouchableOpacity style={styles.submitCommentBtn} onPress={handleComment}>
                    <Text style={styles.submitCommentBtnText}>Publicar Comentario</Text>
                  </TouchableOpacity>
                </View>

                {/* MENSAJE PRIVADO */}
                <View style={[styles.commentFormCard, { marginTop: 16 }]}>
                  <Text style={styles.commentFormTitle}>Contactar Directamente sobre esto</Text>
                  <TextInput
                    placeholder="Tu Correo Electrónico"
                    placeholderTextColor="#64748b"
                    value={msgEmail}
                    onChangeText={setMsgEmail}
                    style={styles.formInput}
                  />
                  <TextInput
                    placeholder="Escribe un mensaje privado para Carlos..."
                    placeholderTextColor="#64748b"
                    value={msgText}
                    onChangeText={setMsgText}
                    multiline
                    style={[styles.formInput, { height: 70 }]}
                  />
                  <TouchableOpacity style={styles.submitPrivateMsgBtn} onPress={handlePrivateMsg}>
                    <Text style={styles.submitPrivateMsgBtnText}>Enviar Mensaje al Desarrollador</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PANEL DE CONTROL ADMINISTRADOR                                     */}
      {/* ========================================================================= */}
      {showAdminModal && (
        <Modal animationType="slide" transparent={true} visible={true} onRequestClose={() => setShowAdminModal(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, { maxWidth: 900 }]}>
              <View style={styles.adminModalHeader}>
                <View style={styles.modalTopNav}>
                  <Text style={styles.adminModalHeading}>Panel de Control del Desarrollador</Text>
                  <TouchableOpacity onPress={() => setShowAdminModal(false)} style={styles.closeBtnCircle}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!token ? (
                <View style={{ padding: 28 }}>
                  <Text style={{ color: '#94a3b8', marginBottom: 18, fontSize: 14 }}>
                    Ingresa tus credenciales administrativas para gestionar proyectos, ideas, perfil, foto de cartelera y mensajes.
                  </Text>
                  <Text style={{ color: '#cbd5e1', marginBottom: 6, fontSize: 13 }}>Usuario:</Text>
                  <TextInput
                    placeholder="Usuario"
                    placeholderTextColor="#64748b"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.formInput}
                  />
                  <Text style={{ color: '#cbd5e1', marginBottom: 6, fontSize: 13 }}>Contraseña:</Text>
                  <TextInput
                    placeholder="Contraseña"
                    secureTextEntry
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.formInput}
                  />
                  <TouchableOpacity style={styles.loginActionBtn} onPress={handleLogin}>
                    <Text style={styles.loginActionBtnText}>Iniciar Sesión Administrativa</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  {/* TABS DE GESTIÓN */}
                  <View style={styles.adminTabsNavbar}>
                    <TouchableOpacity
                      style={[styles.adminTabButton, adminTab === 'projects' && styles.adminTabButtonActive]}
                      onPress={() => { setAdminTab('projects'); fetchAdminProjects(); }}
                    >
                      <Text style={[styles.adminTabButtonText, adminTab === 'projects' && styles.adminTabButtonTextActive]}>
                        Proyectos ({adminRealProjects.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adminTabButton, adminTab === 'ideas' && styles.adminTabButtonActive]}
                      onPress={() => { setAdminTab('ideas'); fetchAdminProjects(); }}
                    >
                      <Text style={[styles.adminTabButtonText, adminTab === 'ideas' && styles.adminTabButtonTextActive]}>
                        Ideas de Desarrollo ({adminIdeaProjects.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adminTabButton, adminTab === 'profile' && styles.adminTabButtonActive]}
                      onPress={() => setAdminTab('profile')}
                    >
                      <Text style={[styles.adminTabButtonText, adminTab === 'profile' && styles.adminTabButtonTextActive]}>
                        Perfil & Cartelera
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adminTabButton, adminTab === 'categories' && styles.adminTabButtonActive]}
                      onPress={() => setAdminTab('categories')}
                    >
                      <Text style={[styles.adminTabButtonText, adminTab === 'categories' && styles.adminTabButtonTextActive]}>
                        Categorías ({categories.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adminTabButton, adminTab === 'messages' && styles.adminTabButtonActive]}
                      onPress={() => { setAdminTab('messages'); fetchAdminMessages(); }}
                    >
                      <Text style={[styles.adminTabButtonText, adminTab === 'messages' && styles.adminTabButtonTextActive]}>
                        Mensajes ({messages.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.adminLogoutButton} onPress={() => setToken(null)}>
                      <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={{ padding: 22 }}>

                    {/* ================================================================= */}
                    {/* TAB: GESTIÓN DE PROYECTOS                                         */}
                    {/* ================================================================= */}
                    {adminTab === 'projects' && (
                      <View>
                        {editingItem ? (
                          <View style={styles.editCardHighlight}>
                            <Text style={styles.adminFormHeading}>Editar Proyecto Existente</Text>
                            <TextInput placeholder="Título del Proyecto" placeholderTextColor="#64748b" value={editItemTitle} onChangeText={setEditItemTitle} style={styles.formInput} />
                            <TextInput placeholder="Descripción del Proyecto" placeholderTextColor="#64748b" value={editItemDesc} onChangeText={setEditItemDesc} multiline style={[styles.formInput, { height: 70 }]} />
                            <TextInput placeholder="URL Repositorio (GitHub)" placeholderTextColor="#64748b" value={editItemRepo} onChangeText={setEditItemRepo} style={styles.formInput} />
                            <TextInput placeholder="URL de la imagen del proyecto" placeholderTextColor="#64748b" value={editItemImageUrl} onChangeText={setEditItemImageUrl} style={styles.formInput} />
                            <TextInput placeholder="Análisis del Problema & Solución Técnica" placeholderTextColor="#64748b" value={editItemDoc} onChangeText={setEditItemDoc} multiline style={[styles.formInput, { height: 70 }]} />

                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                              <TouchableOpacity style={[styles.saveFormBtn, { flex: 1 }]} onPress={handleSaveEdit}>
                                <Text style={styles.saveFormBtnText}>Guardar Cambios de Edición</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setEditingItem(null)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View>
                            <Text style={styles.adminFormHeading}>Publicar Nuevo Proyecto</Text>
                            <TextInput placeholder="Título del Proyecto" placeholderTextColor="#64748b" value={newTitle} onChangeText={setNewTitle} style={styles.formInput} />
                            <TextInput placeholder="Descripción" placeholderTextColor="#64748b" value={newDesc} onChangeText={setNewDesc} multiline style={[styles.formInput, { height: 60 }]} />
                            <TextInput placeholder="URL Repositorio (GitHub)" placeholderTextColor="#64748b" value={newRepo} onChangeText={setNewRepo} style={styles.formInput} />
                            <TextInput placeholder="URL de la imagen del proyecto" placeholderTextColor="#64748b" value={newImageUrl} onChangeText={setNewImageUrl} style={styles.formInput} />
                            <TextInput placeholder="Análisis del Problema & Solución Técnica" placeholderTextColor="#64748b" value={newDoc} onChangeText={setNewDoc} multiline style={[styles.formInput, { height: 60 }]} />

                            <Text style={{ color: '#cbd5e1', marginBottom: 6 }}>Categoría:</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                              {categories.map(c => (
                                <TouchableOpacity key={c.id} onPress={() => setNewCatId(c.id)} style={[styles.categoryPillBtn, newCatId === c.id && styles.categoryPillBtnActive]}>
                                  <Text style={[styles.categoryPillText, newCatId === c.id && styles.categoryPillTextActive]}>{c.name}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <TouchableOpacity style={styles.saveFormBtn} onPress={handleCreateProject}>
                              <Text style={styles.saveFormBtnText}>Guardar Proyecto en Base de Datos</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        <View style={styles.dividerLine} />
                        <Text style={styles.adminFormHeading}>Proyectos Registrados en la Base de Datos</Text>
                        {adminRealProjects.map(p => (
                          <View key={p.id} style={styles.adminItemRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: '#f8fafc', fontWeight: 'bold' }}>{p.title}</Text>
                              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                                {p.category_name} | Votos: {p.votes_count} | Comentarios: {p.comments?.length || 0}
                              </Text>
                            </View>

                            <TouchableOpacity
                              style={[styles.statusToggleBadge, { backgroundColor: p.is_active ? '#10b981' : '#64748b' }]}
                              onPress={() => handleToggleProjectStatus(p.id, p.is_active)}
                            >
                              <Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 11 }}>
                                {p.is_active ? "VISIBLE" : "OCULTO"}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editRowBtn} onPress={() => handleStartEdit(p)}>
                              <Text style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 12 }}>Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteRowBtn} onPress={() => handleDeleteProject(p.id)}>
                              <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>Eliminar</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* ================================================================= */}
                    {/* TAB: GESTIÓN DE IDEAS DE DESARROLLO                               */}
                    {/* ================================================================= */}
                    {adminTab === 'ideas' && (
                      <View>
                        {editingItem ? (
                          <View style={styles.editCardHighlight}>
                            <Text style={styles.adminFormHeading}>Editar Idea de Desarrollo</Text>
                            <TextInput placeholder="Título de la Idea" placeholderTextColor="#64748b" value={editItemTitle} onChangeText={setEditItemTitle} style={styles.formInput} />
                            <TextInput placeholder="Descripción de la Idea" placeholderTextColor="#64748b" value={editItemDesc} onChangeText={setEditItemDesc} multiline style={[styles.formInput, { height: 70 }]} />
                            <TextInput placeholder="URL Repositorio o Roadmap" placeholderTextColor="#64748b" value={editItemRepo} onChangeText={setEditItemRepo} style={styles.formInput} />
                            <TextInput placeholder="URL de la imagen de la idea" placeholderTextColor="#64748b" value={editItemImageUrl} onChangeText={setEditItemImageUrl} style={styles.formInput} />
                            <TextInput placeholder="Visión Técnica y Problema a Resolver" placeholderTextColor="#64748b" value={editItemDoc} onChangeText={setEditItemDoc} multiline style={[styles.formInput, { height: 70 }]} />

                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                              <TouchableOpacity style={[styles.saveFormBtn, { flex: 1 }]} onPress={handleSaveEdit}>
                                <Text style={styles.saveFormBtnText}>Guardar Cambios de la Idea</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setEditingItem(null)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View>
                            <Text style={styles.adminFormHeading}>Publicar Nueva Idea de Desarrollo</Text>
                            <TextInput placeholder="Título de la Idea (ej. Sistema de Agentes Autónomos)" placeholderTextColor="#64748b" value={newIdeaTitle} onChangeText={setNewIdeaTitle} style={styles.formInput} />
                            <TextInput placeholder="Descripción detallada de la propuesta" placeholderTextColor="#64748b" value={newIdeaDesc} onChangeText={setNewIdeaDesc} multiline style={[styles.formInput, { height: 60 }]} />
                            <TextInput placeholder="Visión técnica, justificación o problema que resuelve" placeholderTextColor="#64748b" value={newIdeaDoc} onChangeText={setNewIdeaDoc} multiline style={[styles.formInput, { height: 60 }]} />
                            <TextInput placeholder="URL Repositorio o Roadmap (Opcional)" placeholderTextColor="#64748b" value={newIdeaRepo} onChangeText={setNewIdeaRepo} style={styles.formInput} />
                            <TextInput placeholder="URL de la imagen de la idea" placeholderTextColor="#64748b" value={newIdeaImageUrl} onChangeText={setNewIdeaImageUrl} style={styles.formInput} />

                            <TouchableOpacity style={styles.saveFormBtn} onPress={handleCreateIdea}>
                              <Text style={styles.saveFormBtnText}>Guardar Idea en el Laboratorio</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        <View style={styles.dividerLine} />
                        <Text style={styles.adminFormHeading}>Ideas de Desarrollo en la Base de Datos</Text>
                        {adminIdeaProjects.map(i => (
                          <View key={i.id} style={styles.adminItemRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: '#f8fafc', fontWeight: 'bold' }}>{i.title}</Text>
                              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                                Valoraciones: {i.votes_count} | Comentarios de comunidad: {i.comments?.length || 0}
                              </Text>
                            </View>

                            <TouchableOpacity
                              style={[styles.statusToggleBadge, { backgroundColor: i.is_active ? '#10b981' : '#64748b' }]}
                              onPress={() => handleToggleProjectStatus(i.id, i.is_active)}
                            >
                              <Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 11 }}>
                                {i.is_active ? "VISIBLE" : "OCULTO"}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editRowBtn} onPress={() => handleStartEdit(i)}>
                              <Text style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 12 }}>Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteRowBtn} onPress={() => handleDeleteProject(i.id)}>
                              <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>Eliminar</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* ================================================================= */}
                    {/* TAB: GESTIÓN DE PERFIL, FOTO DE CARTELERA, EXPERIENCIA Y SKILLS   */}
                    {/* ================================================================= */}
                    {adminTab === 'profile' && (
                      <View>
                        <Text style={styles.adminFormHeading}>Foto de Cartelera & Perfil</Text>

                        {/* SECCIÓN FOTO Y PREVIEW */}
                        <View style={styles.avatarEditorSection}>
                          <Image
                            source={{ uri: formattedAvatar }}
                            style={styles.avatarPreviewImg}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 4 }}>
                              URL Directa de la Imagen:
                            </Text>
                            <TextInput
                              placeholder="https://ejemplo.com/tu-foto.jpg"
                              placeholderTextColor="#64748b"
                              value={editAvatarUrl}
                              onChangeText={(val) => {
                                setEditAvatarUrl(val);
                                setAvatarPreview(val);
                              }}
                              style={styles.formInput}
                            />
                            <TouchableOpacity style={styles.uploadLocalBtn} onPress={handlePickLocalImage}>
                              <Text style={styles.uploadLocalBtnText}>Subir Foto desde este Equipo</Text>
                            </TouchableOpacity>
                            {selectedAvatarFile ? (
                              <Text style={{ color: '#10b981', fontSize: 12, marginTop: 4 }}>
                                Archivo cargado: {selectedAvatarFile.name}
                              </Text>
                            ) : null}
                          </View>
                        </View>

                        <Text style={styles.adminFormHeading}>Información Profesional</Text>
                        <Text style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>Nombre Completo:</Text>
                        <TextInput placeholder="Nombre Completo" placeholderTextColor="#64748b" value={editFullName} onChangeText={setEditFullName} style={styles.formInput} />

                        <Text style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>Titular Profesional:</Text>
                        <TextInput placeholder="Titular Profesional" placeholderTextColor="#64748b" value={editHeadline} onChangeText={setEditHeadline} style={styles.formInput} />

                        <Text style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>Descripción y Propuesta de Valor (Cartelera):</Text>
                        <TextInput placeholder="Descripción amplia sobre tu experiencia y lo que puedes hacer" placeholderTextColor="#64748b" value={editBio} onChangeText={setEditBio} multiline style={[styles.formInput, { height: 90 }]} />

                        <Text style={styles.adminFormHeading}>Años de Experiencia</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>Año de Inicio de Carrera:</Text>
                            <TextInput
                              placeholder="2021"
                              placeholderTextColor="#64748b"
                              value={editCareerStartYear}
                              onChangeText={setEditCareerStartYear}
                              keyboardType="numeric"
                              style={styles.formInput}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>Años Calculados / Fijados:</Text>
                            <TextInput
                              placeholder="5"
                              placeholderTextColor="#64748b"
                              value={editExperienceYears}
                              onChangeText={setEditExperienceYears}
                              keyboardType="numeric"
                              style={styles.formInput}
                            />
                          </View>
                        </View>

                        <Text style={styles.adminFormHeading}>Habilidades Técnicas (Skills)</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>
                          Formato con puntuacion de dominio: <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>Nombre:Puntuacion</Text> (0-100), separados por comas.{'\n'}
                          Ejemplo: Python:95, FastAPI:90, Docker:70{'\n'}
                          Si no pones puntuacion, la habilidad aparece sin barra.
                        </Text>
                        <TextInput
                          placeholder="Python:95, FastAPI:90, Django:80, APIs REST:92, PostgreSQL:85, SQLite:88, Docker:70, Git:87"
                          placeholderTextColor="#64748b"
                          value={editSkills}
                          onChangeText={setEditSkills}
                          multiline
                          style={[styles.formInput, { height: 75 }]}
                        />

                        <TouchableOpacity
                          style={[styles.availabilityCardToggle, { backgroundColor: editIsAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}
                          onPress={() => setEditIsAvailable(!editIsAvailable)}
                        >
                          <Text style={{ color: editIsAvailable ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: 13 }}>
                            Estado: {editIsAvailable ? "DISPONIBLE PARA CONTRATACIÓN" : "NO DISPONIBLE ACTUALMENTE"} (Clic para cambiar)
                          </Text>
                        </TouchableOpacity>

                        <Text style={styles.adminFormHeading}>Información de Contacto</Text>
                        <TextInput placeholder="Correo de Contacto" placeholderTextColor="#64748b" value={editEmail} onChangeText={setEditEmail} style={styles.formInput} />
                        <TextInput placeholder="Teléfono" placeholderTextColor="#64748b" value={editPhone} onChangeText={setEditPhone} style={styles.formInput} />
                        <TextInput placeholder="Ubicación / País" placeholderTextColor="#64748b" value={editLocation} onChangeText={setEditLocation} style={styles.formInput} />
                        <TextInput placeholder="GitHub URL" placeholderTextColor="#64748b" value={editGithub} onChangeText={setEditGithub} style={styles.formInput} />
                        <TextInput placeholder="LinkedIn URL" placeholderTextColor="#64748b" value={editLinkedin} onChangeText={setEditLinkedin} style={styles.formInput} />

                        <TouchableOpacity style={styles.saveFormBtn} onPress={handleSaveProfile}>
                          <Text style={styles.saveFormBtnText}>Guardar Todo el Perfil en Base de Datos</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* ================================================================= */}
                    {/* TAB: GESTIÓN DE CATEGORÍAS                                        */}
                    {/* ================================================================= */}
                    {adminTab === 'categories' && (
                      <View>
                        <Text style={styles.adminFormHeading}>Agregar Nueva Categoría</Text>
                        <TextInput placeholder="Nombre de Categoría" placeholderTextColor="#64748b" value={newCategoryName} onChangeText={setNewCategoryName} style={styles.formInput} />
                        <TouchableOpacity style={styles.saveFormBtn} onPress={handleCreateCategory}>
                          <Text style={styles.saveFormBtnText}>Agregar Categoría</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerLine} />
                        <Text style={styles.adminFormHeading}>Categorías Actuales</Text>
                        {categories.map(c => (
                          <View key={c.id} style={styles.adminItemRow}>
                            <Text style={{ color: '#f8fafc', fontWeight: 'bold' }}>{c.name}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* ================================================================= */}
                    {/* TAB: MENSAJES RECIBIDOS                                           */}
                    {/* ================================================================= */}
                    {adminTab === 'messages' && (
                      <View>
                        <Text style={styles.adminFormHeading}>Mensajes Privados Recibidos</Text>
                        {messages.length === 0 ? (
                          <Text style={{ color: '#94a3b8' }}>No hay mensajes recibidos aún.</Text>
                        ) : (
                          messages.map(m => (
                            <View key={m.id} style={styles.messageBoxItem}>
                              <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>De: {m.sender_email}</Text>
                              <Text style={{ color: '#f8fafc', marginTop: 4 }}>{m.message}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    )}

                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* FOOTER */}
      <View style={styles.footerBar}>
        <Text style={styles.footerBarText}>
          © {currentYear} {profile?.full_name || "Carlos Andrés Corrales Díaz"}. Arquitectura Backend con Python y FastAPI.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  toast: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 99999,
  },
  toastText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#38bdf8',
    fontWeight: '900',
    fontSize: 14,
  },
  brandTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialNavBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  socialNavBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  adminKeyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0284c7',
  },
  adminKeyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 60,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },

  // =========================================================================
  // ESTILOS CARTELERA / BILLBOARD HEADER
  // =========================================================================
  billboardContainer: {
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 28,
    overflow: 'hidden',
  },
  billboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
    alignItems: 'flex-start',
  },
  billboardPosterCol: {
    minWidth: 220,
    flex: 1,
    alignSelf: 'stretch',
  },
  billboardPosterFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  billboardPosterImage: {
    width: '100%',
    height: '100%',
  },
  billboardPosterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  posterNameText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  posterRoleText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  locationPill: {
    marginTop: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  locationPillText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  billboardDetailsCol: {
    flex: 2,
    minWidth: 260,
  },
  sectionPillTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  sectionPillTagText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  billboardMainTitle: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 12,
  },
  billboardBioText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  experienceMetricCard: {
    backgroundColor: '#131d31',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  experienceMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  experienceNumber: {
    color: '#38bdf8',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
  },
  experienceLabelBox: {
    flex: 1,
  },
  experienceTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  experienceSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  experienceDetailDescription: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  capabilitiesBox: {
    backgroundColor: '#101827',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  capabilitiesHeader: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  capabilitiesGrid: {
    gap: 8,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  capabilityDot: {
    color: '#38bdf8',
    fontSize: 14,
    lineHeight: 18,
  },
  capabilityText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  capabilityBold: {
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryActionBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryActionBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  outlineActionBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  outlineActionBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },

  // =========================================================================
  // ESTILOS SECCIÓN HABILIDADES
  // =========================================================================
  skillsSectionContainer: {
    marginBottom: 36,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionTitleRow: {
    marginBottom: 18,
  },
  sectionHeading: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubheading: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  skillsChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChipCard: {
    flexDirection: 'column',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 140,
  },
  skillChipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  skillChipAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
    flexShrink: 0,
  },
  skillChipLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  skillChipScore: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  skillBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  skillBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // =========================================================================
  // ESTILOS SECCIÓN IDEAS DE DESARROLLO
  // =========================================================================
  ideasSectionContainer: {
    marginBottom: 40,
    backgroundColor: '#0c1322',
    borderRadius: 16,
    padding: 26,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  labBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  labBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  ideasGrid: {
    gap: 16,
    marginTop: 10,
  },
  ideaCard: {
    backgroundColor: '#131e33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
  },
  ideaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ideaTypeBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ideaTypeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ideaCategoryBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ideaCategoryBadgeText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  ideaTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ideaDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  ideaVisionBox: {
    backgroundColor: '#0d1526',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    marginBottom: 14,
  },
  ideaVisionHeading: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ideaVisionText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  ideaCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
  },
  voteIdeaBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  voteIdeaBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  voteIdeaBtnVoted: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    opacity: 0.6,
  },
  commentIdeaBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  commentIdeaBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // =========================================================================
  // ESTILOS SECCIÓN PROYECTOS
  // =========================================================================
  hiddenAdminDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e293b',
    alignSelf: 'center',
    marginBottom: 10,
    opacity: 0.3,
  },
  projectsSectionContainer: {
    marginBottom: 40,
  },
  filterBar: {
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchInputField: {
    flex: 1,
    height: 44,
    color: '#f8fafc',
    fontSize: 14,
  },
  categoryScrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  categoryPillBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  categoryPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingLabel: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 13,
  },
  emptyCardBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyTitleText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtitleText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  projectCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardCoverContainer: {
    height: 180,
    backgroundColor: '#1e293b',
    position: 'relative',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
  },
  cardCategoryPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardCategoryPillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardBodyContent: {
    padding: 16,
    flex: 1,
  },
  cardTitleText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescriptionText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardTechWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTechBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardTechBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  cardFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  voteCardBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  voteCardBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  detailCardBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailCardBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // =========================================================================
  // ESTILOS MODAL GENERAL
  // =========================================================================
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '90%',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  modalTopNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalItemCategoryBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  modalItemCategoryBadgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalItemTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 14,
  },
  modalBannerImg: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 18,
  },
  modalContentHeading: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBodyParagraph: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  problemDocCard: {
    backgroundColor: '#131d31',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
    marginBottom: 18,
  },
  problemDocHeading: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  problemDocBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  modalInteractBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  repoBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  repoBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  voteModalBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
  },
  voteModalBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 18,
  },
  commentsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  noCommentsNotice: {
    color: '#64748b',
    fontStyle: 'italic',
    fontSize: 13,
  },
  commentItemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
  },
  commentAuthorName: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  commentContentText: {
    color: '#f8fafc',
    fontSize: 13,
    marginTop: 4,
  },
  commentFormCard: {
    backgroundColor: '#131d31',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  commentFormTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#090d16',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  submitCommentBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitCommentBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  submitPrivateMsgBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitPrivateMsgBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // =========================================================================
  // ESTILOS PANEL ADMIN
  // =========================================================================
  adminModalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  adminModalHeading: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminTabsNavbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0b1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  adminTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  adminTabButtonActive: {
    borderBottomColor: '#38bdf8',
  },
  adminTabButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  adminTabButtonTextActive: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  adminLogoutButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  adminFormHeading: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  saveFormBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  saveFormBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  loginActionBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  loginActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  editCardHighlight: {
    backgroundColor: '#131e33',
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginBottom: 16,
  },
  cancelBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold',
  },
  adminItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  statusToggleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editRowBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteRowBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  avatarEditorSection: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#131e33',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatarPreviewImg: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
  uploadLocalBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadLocalBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  availabilityCardToggle: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  messageBoxItem: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  footerBar: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0b1120',
  },
  footerBarText: {
    color: '#64748b',
    fontSize: 12,
  },
});