self.addEventListener('install', e => {
  e.waitUntil(caches.open('quiz-cache').then(cache => cache.addAll([
    '/',
    '/index.html',
    '/exam.html',
    '/style.css',
    '/exam.js',
    '/manifest.json'
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});