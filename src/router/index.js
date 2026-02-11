import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingView.vue'),
  },
  {
    path: '/host/:votingId',
    name: 'Host',
    component: () => import('../views/HostView.vue'),
    props: true,
  },
  {
    path: '/vote/:votingId/:roomId',
    name: 'Vote',
    component: () => import('../views/VoteView.vue'),
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
