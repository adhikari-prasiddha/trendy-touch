import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        booking: resolve(__dirname, 'booking.html'),
        academy: resolve(__dirname, 'academy.html'),
        admin: resolve(__dirname, 'admin.html'),
        student: resolve(__dirname, 'student.html'),
      },
    },
  },
});
