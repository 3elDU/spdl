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
          performLocalSearch: route.query?.performLocalSearch === 'true',
        }),
      },
      {
        path: 'library',
        name: 'library',
        component: () => import('pages/LibraryPage.vue'),
        meta: { title: 'Library ' },
      },
      {
        path: 'tracklist/:type/:id',
        name: 'tracklist',
        props: true,
        component: () => import('pages/TrackListPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/PreferencesPage.vue'),
        meta: { title: 'Preferences ' },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
