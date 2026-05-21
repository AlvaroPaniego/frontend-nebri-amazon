<template>
  <div class="admin-view container">
    <div class="admin-header">
      <h2 class="view-title">Consola de Administración</h2>
      <BaseButton variant="primary" @click="openCreateModal">
        ➕ Registrar Nuevo Producto
      </BaseButton>
    </div>

    <!-- Modal Formulario (Creación y Edición) -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-card float-in">
        <div class="modal-header">
          <h3>{{ editingId ? 'Editar Producto' : 'Registrar Producto' }}</h3>
          <button @click="closeModal" class="close-modal-btn">×</button>
        </div>
        
        <form @submit.prevent="saveProduct" class="modal-form">
          <BaseInput label="Nombre del Producto" placeholder="Ej: Auriculares Inalámbricos" v-model="form.name" :error="errors.name" />
          <BaseInput label="Código SKU único" placeholder="Ej: TEC-AUR-104" v-model="form.sku" :error="errors.sku" :disabled="!!editingId" />
          
          <div class="form-row">
            <BaseInput label="Precio (€)" placeholder="49.99" type="number" v-model.number="form.price" :error="errors.price" />
            <BaseInput label="Existencias de Stock" placeholder="10" type="number" v-model.number="form.stock" :error="errors.stock" />
          </div>

          <div class="form-group">
            <label class="form-label">Categoría del Producto</label>
            <select v-model.number="form.category_id" class="category-select">
              <option value="1">Tecnología</option>
              <option value="2">Hogar</option>
              <option value="3">Deportes</option>
              <option value="4">Libros</option>
            </select>
          </div>

          <BaseInput label="URL de Imagen Destacada" placeholder="https://unsplash.com/..." v-model="form.image_url" :error="errors.image_url" />

          <div class="form-group">
            <label class="form-label">Descripción Técnica</label>
            <textarea placeholder="Detalla las características físicas..." v-model="form.description" class="desc-textarea"></textarea>
          </div>

          <div class="modal-footer">
            <BaseButton variant="text" @click="closeModal">Cancelar</BaseButton>
            <BaseButton type="submit" variant="primary" :loading="saving">
              Guardar Cambios
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Listado del Catálogo Actual -->
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productStore.products" :key="product.id">
            <td>
              <img
                :src="product.image_urls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'"
                :alt="product.name"
                class="table-product-img"
              />
            </td>
            <td class="font-bold">{{ product.name }}</td>
            <td class="font-mono">{{ product.sku }}</td>
            <td>{{ getCategoryName(product.category_id) }}</td>
            <td class="font-bold text-accent">{{ formatPrice(product.price) }}</td>
            <td>
              <span :class="['stock-indicator', getStockClass(product.stock)]">
                {{ product.stock }} uds
              </span>
            </td>
            <td>
              <div class="actions-cell">
                <button @click="openEditModal(product)" class="edit-btn">✏️ Editar</button>
                <button @click="deleteProduct(product.id)" class="delete-btn">🗑️ Borrar</button>
              </div>
            </td>
          </tr>
          <tr v-if="productStore.products.length === 0">
            <td colspan="7" class="empty-table-cell">No hay productos en el catálogo. Registra uno nuevo.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useProductStore } from '@/store/products';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const productStore = useProductStore();

const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = reactive({
  name: '',
  sku: '',
  price: 0,
  stock: 0,
  category_id: 1,
  image_url: '',
  description: ''
});

const errors = reactive({
  name: '',
  sku: '',
  price: '',
  stock: '',
  image_url: ''
});

const getCategoryName = (id) => {
  const mapping = { 1: 'Tecnología', 2: 'Hogar', 3: 'Deportes', 4: 'Libros' };
  return mapping[id] || 'General';
};

const getStockClass = (stock) => {
  if (stock === 0) return 'stock-out';
  if (stock <= 5) return 'stock-low';
  return 'stock-ok';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

const openCreateModal = () => {
  editingId.value = null;
  form.name = '';
  form.sku = '';
  form.price = 9.99;
  form.stock = 10;
  form.category_id = 1;
  form.image_url = '';
  form.description = '';
  
  // Limpiar errores
  Object.keys(errors).forEach(k => errors[k] = '');
  showModal.value = true;
};

const openEditModal = (product) => {
  editingId.value = product.id;
  form.name = product.name;
  form.sku = product.sku;
  form.price = product.price;
  form.stock = product.stock;
  form.category_id = product.category_id;
  form.image_url = product.image_urls?.[0] || '';
  form.description = product.description || '';

  Object.keys(errors).forEach(k => errors[k] = '');
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(k => errors[k] = '');

  if (!form.name.trim()) { errors.name = 'El nombre es obligatorio'; isValid = false; }
  if (!form.sku.trim()) { errors.sku = 'El código SKU es obligatorio'; isValid = false; }
  if (form.price <= 0) { errors.price = 'El precio debe ser mayor que 0'; isValid = false; }
  if (form.stock < 0) { errors.stock = 'El stock no puede ser negativo'; isValid = false; }

  return isValid;
};

const saveProduct = async () => {
  if (!validateForm()) return;

  saving.value = true;
  const payload = {
    name: form.name,
    sku: form.sku,
    price: Number(form.price),
    stock: Number(form.stock),
    category_id: Number(form.category_id),
    image_urls: form.image_url ? [form.image_url] : [],
    description: form.description
  };

  try {
    if (editingId.value) {
      await productStore.updateProduct(editingId.value, payload);
    } else {
      await productStore.createProduct(payload);
    }
    showModal.value = false;
  } catch (error) {
    // Simulación offline si no hay backend activo
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      if (editingId.value) {
        // Simular update local
        const index = productStore.products.findIndex(p => p.id === editingId.value);
        if (index !== -1) {
          productStore.products[index] = { ...productStore.products[index], ...payload };
        }
      } else {
        // Simular create local
        payload.id = 'mock_' + Date.now();
        productStore.products.push(payload);
      }
      showModal.value = false;
    } else {
      alert(error.message || 'Error al guardar el producto.');
    }
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar lógicamente (Soft Delete) este producto?')) return;

  try {
    await productStore.deleteProduct(id);
  } catch (error) {
    // Simulación offline de delete
    productStore.products = productStore.products.filter(p => p.id !== id);
  }
};

onMounted(async () => {
  // Asegura que los productos estén cargados al entrar aquí
  if (productStore.products.length === 0) {
    await productStore.fetchProducts();
  }
});
</script>

<style scoped>
.admin-view {
  padding: 30px 20px 60px;
  min-height: calc(100vh - 70px - 60px);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.view-title {
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
}

.admin-table-wrapper {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.admin-table th, .admin-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.admin-table th {
  background-color: var(--color-background);
  font-family: var(--font-title);
  font-weight: 700;
  color: var(--color-primary);
}

.table-product-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
}

.font-bold { font-weight: 600; }
.font-mono { font-family: monospace; font-size: 0.85rem; color: var(--color-text-muted); }
.text-accent { color: var(--color-accent); }

.stock-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
}

.stock-ok { background-color: rgba(34, 197, 94, 0.1); color: var(--color-success); }
.stock-low { background-color: rgba(245, 158, 11, 0.1); color: var(--color-warning); }
.stock-out { background-color: rgba(239, 68, 68, 0.1); color: var(--color-error); }

.actions-cell {
  display: flex;
  gap: 12px;
}

.edit-btn, .delete-btn {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.edit-btn {
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.edit-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.delete-btn {
  background-color: rgba(239, 68, 68, 0.05);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.delete-btn:hover {
  background-color: var(--color-error);
  color: var(--color-surface);
}

.empty-table-cell {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px !important;
}

/* Modal form style */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(19, 25, 33, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-family: var(--font-title);
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 700;
}

.close-modal-btn {
  font-size: 1.8rem;
  color: var(--color-text-muted);
}

.close-modal-btn:hover {
  color: var(--color-error);
}

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.category-select {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  background-color: var(--color-background);
  font-weight: 500;
  min-height: 44px;
}

.category-select:focus {
  border-color: var(--color-accent);
}

.desc-textarea {
  width: 100%;
  height: 90px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  background-color: var(--color-background);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.desc-textarea:focus {
  border-color: var(--color-accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
  margin-top: 8px;
}
</style>
