// sw.js (Service Worker)

const CACHE_NAME = 'blackstories-cache-v1.3'; // Versionsnummer erhöhen bei Änderungen an gecachten Dateien!
const urlsToCache = [
    './', // Alias für index.html im Root-Verzeichnis
    './index.html',
    './style.css',
    './script.js',
    './initial_stories.js', // Auch wenn primär LocalStorage genutzt wird, schadet das Caching nicht
    './icon-192x192.png',
    './icon-512x512.png'
    // Füge hier weitere wichtige Assets hinzu, falls du welche hast (z.B. Schriftarten)
];

// Installation des Service Workers: Cache öffnen und Dateien hinzufügen
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and adding files to cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache files during install:', error);
            })
    );
    self.skipWaiting(); // Erzwingt, dass der neue SW sofort aktiv wird
});

// Aktivierung des Service Workers: Alte Caches löschen
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Übernimmt Kontrolle über offene Clients
});

// Fetch-Ereignisse abfangen: Aus Cache bedienen oder Netzwerk-Fallback
self.addEventListener('fetch', event => {
    // Nur GET-Requests bearbeiten
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Wichtig: Klonen des Requests. Ein Request ist ein Stream und kann nur einmal konsumiert werden.
                // Wir müssen ihn einmal für den Cache und einmal für den Browser-Fetch klonen.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(networkResponse => {
                        // Prüfen, ob wir eine valide Antwort vom Netzwerk bekommen haben
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Wichtig: Klonen der Antwort. Eine Antwort ist ein Stream und kann nur einmal konsumiert werden.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Fetch failed; returning offline page instead.', error);
                    // Optional: Eine spezielle Offline-Fallback-Seite anzeigen
                    // return caches.match('./offline.html'); // Wenn du eine offline.html hättest
                });
            })
    );
});