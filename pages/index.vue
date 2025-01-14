<template>
  <div class="home-page">
    <div class="cards">
      <div v-for="(item, index) in 12" class="card"></div>
    </div>
    <canvas class="canvas"></canvas>
  </div>
</template>

<script setup>
import { useImageStore } from "@/store/imagesLoaded";

const imageStore = useImageStore();

watch(
  () => imageStore.isLoaded,
  (curr) => {
    const oglScene = new useOglScene();
  }
);

onMounted(() => {
  const imageUrls = [];

  for (let i = 0; i < imageStore.totalImages; i++) {
    imageUrls.push(`images/${i + 1}.png`);
  }

  imageStore.preloadImages(imageUrls);
});
</script>

<style lang="scss" scoped>
.home-page {
  --page-padding: 40px;

  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  padding: var(--page-padding);

  .cards {
    position: absolute;
    width: calc(100% - 2 * var(--page-padding));
    height: 120rem;
    visibility: hidden;
  }

  .card {
    position: absolute;
    width: 300px;
    height: 460px;

    &:nth-child(2) {
      left: 30rem;
      top: 10rem;
    }
    &:nth-child(3) {
      left: 60rem;
      top: 5rem;
    }
    &:nth-child(4) {
      right: 0;
      top: 2rem;
    }
    &:nth-child(5) {
      left: 3rem;
      top: 40rem;
    }
    &:nth-child(6) {
      top: 50rem;
      left: 35rem;
    }
    &:nth-child(7) {
      top: 40rem;
      left: 63rem;
    }
    &:nth-child(8) {
      top: 40rem;
      right: 5rem;
    }
    &:nth-child(9) {
      top: 80rem;
      left: 5rem;
    }
    &:nth-child(10) {
      top: 85rem;
      left: 33rem;
    }
    &:nth-child(11) {
      top: 78rem;
      left: 65rem;
    }
    &:nth-child(12) {
      top: 78rem;
      right: 0;
    }
    .img {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
  }
  .canvas {
    position: fixed;
    inset: 0;
  }
}
</style>
