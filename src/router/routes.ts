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
        name: 'album',
        path: 'album/:id',
        props: true,
        component: () => import('pages/AlbumPage.vue'),
      },
      {
        name: 'playlist',
        path: 'playlist/:id',
        props: true,
        component: () => import('pages/PlaylistPage.vue'),
      },
      {
        name: 'favourites',
        path: 'favourites',
        meta: { title: 'Favourite tracks' },
        component: () => import('pages/LikedTracksPage.vue'),
      },
      {
        path: 'artist/:id',
        name: 'artist',
        props: true,
        component: () => import('pages/ArtistPage.vue'),
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
