import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const parts = req.url.split('?');
        const pathname = parts[0];
        const search = parts[1] ? '?' + parts[1] : '';
        
        // Rewrite to .html internally if it is a clean URL path (no extension, not ending in slash)
        if (pathname !== '/' && !pathname.includes('.') && !pathname.endsWith('/')) {
          req.url = pathname + '.html' + search;
        }
        next();
      });
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        booking: resolve(__dirname, 'booking.html'),
        academy: resolve(__dirname, 'academy.html'),
        admin: resolve(__dirname, 'admin.html'),
        student: resolve(__dirname, 'student.html'),
        services: resolve(__dirname, 'services.html'),
        packages: resolve(__dirname, 'packages.html'),
        products: resolve(__dirname, 'products.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
