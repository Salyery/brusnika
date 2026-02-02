<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="448"
    scrollable
    class="create-member-dialog"
  >
    <v-card class="create-member-card" :rounded="false">
      <v-card-title class="create-member-header">
        <h2 class="create-member-title">{{ member ? 'Редактировать участника' : 'Создать участника' }}</h2>
        <button class="create-member-close-btn" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="create-member-content">
        <form @submit.prevent="handleSubmit" class="create-member-form">
          <!-- Фамилия -->
          <div class="form-field">
            <label class="form-label">Фамилия *</label>
            <input
              v-model="lastName"
              type="text"
              required
              class="form-input"
              placeholder="Иванов"
            />
          </div>

          <!-- Имя -->
          <div class="form-field">
            <label class="form-label">Имя *</label>
            <input
              v-model="firstName"
              type="text"
              required
              class="form-input"
              placeholder="Иван"
            />
          </div>

          <!-- Отчество -->
          <div class="form-field">
            <label class="form-label">Отчество</label>
            <input
              v-model="middleName"
              type="text"
              class="form-input"
              placeholder="Иванович"
            />
          </div>

          <!-- E-mail -->
          <div class="form-field">
            <label class="form-label">E-mail{{ member ? ' *' : '' }}</label>
            <input
              v-model="email"
              type="email"
              :required="!!member"
              class="form-input"
              placeholder="ivanov@example.com"
            />
          </div>

          <!-- Кнопки -->
          <div class="form-actions">
            <button
              type="button"
              class="form-btn form-btn-cancel"
              @click="handleClose"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="form-btn form-btn-submit"
              :disabled="!firstName.trim() || !lastName.trim() || (member && !email.trim())"
            >
              {{ member ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { TeamMember } from '@/types';

interface Props {
  isOpen: boolean;
  member?: TeamMember | null;
}

const props = withDefaults(defineProps<Props>(), {
  member: null,
});

const emit = defineEmits<{
  close: [];
  submit: [member: TeamMember];
  'update-member': [member: TeamMember];
}>();

const firstName = ref('');
const lastName = ref('');
const middleName = ref('');
const email = ref('');

watch(() => [props.isOpen, props.member], ([isOpen, member]) => {
  if (isOpen && member) {
    // Load member data for editing
    firstName.value = member.firstName || '';
    lastName.value = member.lastName || '';
    middleName.value = member.middleName || '';
    email.value = member.email || '';
  } else if (!isOpen) {
    handleClose();
  }
});

const handleSubmit = () => {
  if (!firstName.value.trim() || !lastName.value.trim()) {
    alert('Фамилия и имя обязательны для заполнения');
    return;
  }

  if (props.member && !email.value.trim()) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }

  const fullName = [lastName.value.trim(), firstName.value.trim(), middleName.value.trim()]
    .filter(Boolean)
    .join(' ');

  const updatedMember: TeamMember = props.member
    ? {
        ...props.member,
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        middleName: middleName.value.trim() || undefined,
        name: fullName,
        email: email.value.trim(),
      }
    : {
        id: `m${Date.now()}`,
        name: fullName,
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        middleName: middleName.value.trim() || undefined,
        email: email.value.trim() || undefined,
      };

  if (props.member) {
    emit('update-member', updatedMember);
  } else {
    emit('submit', updatedMember);
  }
  handleClose();
};

const handleClose = () => {
  if (props.member) {
    // Reset to member values for edit mode
    firstName.value = props.member.firstName || '';
    lastName.value = props.member.lastName || '';
    middleName.value = props.member.middleName || '';
    email.value = props.member.email || '';
  } else {
    // Clear for add mode
    firstName.value = '';
    lastName.value = '';
    middleName.value = '';
    email.value = '';
  }
  emit('close');
};
</script>

<style scoped>
.create-member-form {
  display: flex;
  flex-direction: column;
  gap: 16px; /* space-y-4 = 1rem = 16px */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px; /* mb-1 = 0.25rem = 4px */
}

.form-label {
  font-size: 14px; /* text-sm = 0.875rem = 14px */
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
  margin-bottom: 4px; /* mb-1 = 0.25rem = 4px */
}

.form-input {
  width: 100%;
  padding: 8px 12px; /* py-2 px-3 = 8px 12px */
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB; /* border-gray-300 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #2196F3; /* focus:border-primary-500 */
  box-shadow: 0 0 0 2px #2196F3; /* focus:ring-2 focus:ring-primary-500 */
}

.form-input::placeholder {
  color: #9E9E9E; /* placeholder-gray-500 */
  opacity: 1;
}

/* Form actions - matching React version */
.form-actions {
  display: flex;
  gap: 8px; /* gap-2 = 0.5rem = 8px */
  padding-top: 12px; /* pt-3 = 0.75rem = 12px */
  border-top: 1px solid #E5E7EB; /* border-t border-gray-200 */
  width: 100%;
}

.form-btn {
  flex: 1;
  padding: 8px 16px; /* py-2 px-4 = 8px 16px */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-weight: 500; /* font-medium */
  font-size: 14px; /* text-sm */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.form-btn-cancel {
  background-color: transparent;
  color: #374151; /* text-gray-700 */
}

.form-btn-cancel:hover {
  background-color: #F3F4F6; /* hover:bg-gray-100 */
}

.form-btn-submit {
  background-color: #1E88E5; /* bg-primary-600 */
  color: #FFFFFF;
}

.form-btn-submit:hover:not(:disabled) {
  background-color: #1976D2; /* hover:bg-primary-700 */
}

.form-btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
