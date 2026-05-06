<template>
  <div>
    <input type="file" @change="handleFileUpload" />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("sound", file);

      const response = await axios.post("http://localhost:8000/upload-sound/", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log(response.data.visualization);
    }
  }
};
</script>