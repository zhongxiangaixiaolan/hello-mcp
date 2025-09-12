<template>
  <div class="settings-card" :class="cardClass">
    <div class="card-header" v-if="title || $slots.header">
      <slot name="header">
        <div class="card-title">
          <span class="title-icon" v-if="icon">{{ icon }}</span>
          <h3 class="title-text">{{ title }}</h3>
          <span v-if="badge" class="title-badge">{{ badge }}</span>
        </div>
        <div class="card-actions" v-if="$slots.actions">
          <slot name="actions"></slot>
        </div>
      </slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: true
  }
})

const cardClass = computed(() => ({
  [`card-${props.variant}`]: true,
  [`card-${props.size}`]: true,
  'card-hoverable': props.hoverable
}))
</script>

<style scoped>
.settings-card {
  background: linear-gradient(135deg, #1e1e1e, #252526);
  border: 1px solid #3e3e42;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.settings-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4ec9b0, #569cd6, #c586c0);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-hoverable:hover {
  border-color: #4e4e52;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.card-hoverable:hover::before {
  opacity: 1;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #3e3e42;
  background: linear-gradient(135deg, #2d2d30, #3e3e42);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.title-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4ec9b0, #569cd6);
  border-radius: 8px;
  color: white;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.title-badge {
  background: linear-gradient(135deg, #4ec9b0, #569cd6);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 卡片内容 */
.card-body {
  padding: 24px;
  color: #cccccc;
}

/* 卡片底部 */
.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #3e3e42;
  background: #2d2d30;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 卡片变体 */
.card-primary {
  border-color: #0e639c;
}

.card-primary::before {
  background: linear-gradient(90deg, #0e639c, #1177bb);
}

.card-success {
  border-color: #4ec9b0;
}

.card-success::before {
  background: linear-gradient(90deg, #4ec9b0, #6bb6ff);
}

.card-warning {
  border-color: #ffcc02;
}

.card-warning::before {
  background: linear-gradient(90deg, #ffcc02, #ff9500);
}

.card-danger {
  border-color: #f44747;
}

.card-danger::before {
  background: linear-gradient(90deg, #f44747, #ff6b6b);
}

/* 卡片尺寸 */
.card-small .card-header,
.card-small .card-body,
.card-small .card-footer {
  padding: 16px 20px;
}

.card-large .card-header,
.card-large .card-body,
.card-large .card-footer {
  padding: 28px 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .card-footer {
    padding: 16px 20px;
    flex-direction: column;
  }
  
  .title-text {
    font-size: 16px;
  }
}
</style>
