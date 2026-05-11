import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  // err: The actual error object
  // instance: The Vue component instance where the error occurred
  // info: A Vue-specific string (e.g., "lifecycle hook")
  
  console.error('Global Error:', err)
  console.log('Component context:', instance)
  console.log('Error info:', info)
  
  // Example: Send to an error tracking service like Sentry
  // Sentry.captureException(err)
}

app.mount('#app')