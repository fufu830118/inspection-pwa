import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/category/:categoryId/equipment',
    name: 'equipment-list',
    component: () => import('../views/EquipmentList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/scan',
    name: 'scan',
    component: () => import('../views/Scan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/History.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inspection/:categoryId/:equipmentId',
    name: 'inspection-form',
    component: () => import('../views/InspectionForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inspection/:equipmentId',
    name: 'inspection',
    component: () => import('../views/InspectionForm.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('../views/AuthCallback.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
