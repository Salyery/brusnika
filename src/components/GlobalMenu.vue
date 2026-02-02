<template>
  <div class="global-menu">
    <div class="global-menu-container">
      <div class="global-menu-left">
        <div class="global-menu-title">
          Управление проектами D Innovate Group
        </div>
        
        <!-- Desktop navigation -->
        <nav class="global-menu-nav global-menu-nav-desktop">
          <button
            :class="['global-menu-btn', { 'active': activeSection === 'projects' }]"
            @click="handleSectionChange('projects')"
          >
            <FolderOpen :size="16" />
            Проекты
          </button>
          
          <button
            :class="['global-menu-btn', { 'active': activeSection === 'clients' }]"
            @click="handleSectionChange('clients')"
          >
            <Building2 :size="16" />
            Клиенты
          </button>
          
          <a
            href="https://docs.google.com/document/d/1TD3VaubNsW-qLw7L9aZMHxx8-7f173bCVPWyA3tOV6M/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            class="global-menu-btn"
          >
            <BookOpen :size="16" />
            Инструкция
          </a>
        </nav>

        <!-- Mobile menu button -->
        <button
          class="global-menu-mobile-toggle"
          @click="toggleMobileMenu"
          aria-label="Открыть меню"
        >
          <Menu v-if="!isMobileMenuOpen" :size="20" />
          <X v-else :size="20" />
        </button>
      </div>

      <!-- Desktop logout -->
      <button
        class="global-menu-logout global-menu-logout-desktop"
        @click="handleLogout"
        title="Выйти"
      >
        <LogOut :size="16" />
        <span>Выход</span>
      </button>
    </div>

    <!-- Mobile menu dropdown -->
    <div v-if="isMobileMenuOpen" class="global-menu-mobile-dropdown">
      <nav class="global-menu-nav-mobile">
        <button
          :class="['global-menu-mobile-btn', { 'active': activeSection === 'projects' }]"
          @click="handleMobileSectionChange('projects')"
        >
          <FolderOpen :size="18" />
          Проекты
        </button>
        
        <button
          :class="['global-menu-mobile-btn', { 'active': activeSection === 'clients' }]"
          @click="handleMobileSectionChange('clients')"
        >
          <Building2 :size="18" />
          Клиенты
        </button>
        
        <a
          href="https://docs.google.com/document/d/1TD3VaubNsW-qLw7L9aZMHxx8-7f173bCVPWyA3tOV6M/edit?tab=t.0"
          target="_blank"
          rel="noopener noreferrer"
          class="global-menu-mobile-btn"
          @click="closeMobileMenu"
        >
          <BookOpen :size="18" />
          Инструкция
        </a>

        <button
          class="global-menu-mobile-btn global-menu-mobile-logout"
          @click="handleMobileLogout"
        >
          <LogOut :size="18" />
          Выход
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FolderOpen, Building2, LogOut, BookOpen, Menu, X } from 'lucide-vue-next';

interface Props {
  activeSection: 'projects' | 'clients';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  sectionChange: [section: 'projects' | 'clients'];
}>();

const isMobileMenuOpen = ref(false);

const handleSectionChange = (section: 'projects' | 'clients') => {
  emit('sectionChange', section);
};

const handleMobileSectionChange = (section: 'projects' | 'clients') => {
  handleSectionChange(section);
  closeMobileMenu();
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    // Здесь будет логика выхода
    console.log('Logout');
  }
};

const handleMobileLogout = () => {
  closeMobileMenu();
  handleLogout();
};
</script>

<style scoped>
.global-menu {
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: relative;
}

.global-menu-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.global-menu-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

.global-menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.global-menu-nav {
  display: flex;
  gap: 4px;
}

.global-menu-nav-desktop {
  display: flex;
}

.global-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  white-space: nowrap;
}

.global-menu-btn:hover {
  background-color: #F5F5F5;
  color: #212121;
}

.global-menu-btn.active {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.global-menu-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.global-menu-logout:hover {
  background-color: #FAFAFA;
  color: #212121;
}

/* Mobile menu toggle button */
.global-menu-mobile-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.global-menu-mobile-toggle:hover {
  background-color: #F5F5F5;
  color: #212121;
}

/* Mobile dropdown menu */
.global-menu-mobile-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.global-menu-nav-mobile {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
}

.global-menu-mobile-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  text-align: left;
  width: 100%;
}

.global-menu-mobile-btn:hover {
  background-color: #F5F5F5;
  color: #212121;
}

.global-menu-mobile-btn.active {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: 600;
}

.global-menu-mobile-logout {
  border-top: 1px solid #E0E0E0;
  margin-top: 4px;
  padding-top: 12px;
}

/* Mobile styles */
@media (max-width: 768px) {
  .global-menu-container {
    padding: 0 16px;
  }

  .global-menu-title {
    font-size: 14px;
    flex: 1;
    min-width: 0;
  }

  .global-menu-nav-desktop {
    display: none;
  }

  .global-menu-logout-desktop {
    display: none;
  }

  .global-menu-mobile-toggle {
    display: flex;
  }

  .global-menu-mobile-dropdown {
    display: block;
  }

  .global-menu-left {
    gap: 12px;
  }
}

/* Tablet styles */
@media (max-width: 1024px) {
  .global-menu-title {
    font-size: 14px;
  }
}
</style>