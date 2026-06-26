import { resolve } from 'path';
import { defineConfig } from 'vite';

// Plugin: Rewrites clean URLs (e.g. /services) to their .html counterpart internally
// so the Vite dev server can serve them without a 404.
const cleanUrlsPlugin = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const parts = req.url.split('?');
      const pathname = parts[0];
      const search = parts[1] ? '?' + parts[1] : '';

      // Only rewrite paths with no file extension and not root /
      if (pathname !== '/' && !pathname.includes('.') && !pathname.endsWith('/')) {
        req.url = pathname + '.html' + search;
      }
      next();
    });
  }
};

export default defineConfig({
  plugins: [cleanUrlsPlugin],
  server: {
    port: 5173,
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

