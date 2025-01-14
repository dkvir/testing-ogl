export const useImageStore = defineStore("imageStore", {
  state: () => ({
    images: [],
    loadedImages: [],
    isLoading: false,
    isLoaded: false,
    totalImages: 1001,
  }),
  actions: {
    async preloadImages(imageUrls) {
      this.isLoading = true;
      const promises = imageUrls.map((url) => this.preloadImage(url));
      await Promise.all(promises);
      this.isLoading = false;
      this.isLoaded = true;
    },
    preloadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          this.loadedImages.push(img);
          resolve();
        };
        img.onerror = reject;
      });
    },
  },
});
