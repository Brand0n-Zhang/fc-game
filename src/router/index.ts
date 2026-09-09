import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Game from '@/pages/Game/Game.vue'
import Prepare from '@/pages/Prepare/Prepare.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Prepare',
    component: Prepare,
    meta: { title: '组建阵容' },
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: { title: 'Football Clash Cards' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Prepare' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) document.title = title
})

export default router
