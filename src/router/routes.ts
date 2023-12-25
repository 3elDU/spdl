import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/HomePage.vue'),
        meta: { title: 'Home' },
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/AuthenticationPage.vue'),
        meta: { title: 'Spotify authentication' },
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/SearchPage.vue'),
        meta: { title: 'Search' },
        props: (route) => ({
          query: route.query?.query,
          // Convert string back to boolean
          searchLocal: route.query?.searchLocal === 'true',
        }),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/PreferencesPage.vue'),
        meta: { title: 'Preferences ' },
      },
      /*
      {
        path: 'info',
        component: () => import('pages/InfoPage.vue'),
        meta: { title: 'Info' },
      },
      */
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
