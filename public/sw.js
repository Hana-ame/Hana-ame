// public/sw.js
self.addEventListener('push', event => {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://avemujica.bang-dream.com/wordpress/wp-content/themes/avemujica/img/moon-r.svg',
        vibrate: [200, 100, 200]
      })
    );
  });