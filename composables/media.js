import { Mesh, Program, Texture } from "ogl";
import fragment from "public/glsl/fragment.glsl";
import vertex from "public/glsl/vertex.glsl";
import { useImageStore } from "@/store/imagesLoaded";

export const useMedia = class {
  constructor({
    element,
    geometry,
    gl,
    height,
    scene,
    screen,
    viewport,
    index,
  }) {
    this.element = element;

    this.extra = 0;
    this.height = height;
    this.geometry = geometry;
    this.gl = gl;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.cardIndex = index;
    this.imageStore = useImageStore();

    this.textureIndex = index;
    this.totalTextures = this.imageStore.totalImages;

    this.createMesh();
    this.createBounds();

    this.onResize();
  }

  // createMesh() {
  //   const texture = new Texture(this.gl, {
  //     generateMipmaps: false,
  //   });

  //   const image = this.imageStore.loadedImages[this.textureIndex];
  //   texture.image = image;

  //   const program = new Program(this.gl, {
  //     fragment,
  //     vertex,
  //     uniforms: {
  //       tMap: { value: texture },
  //       uPlaneSizes: { value: [0, 0] },
  //       uImageSizes: { value: [0, 0] },
  //       uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
  //       uStrength: { value: 0 },
  //     },
  //     transparent: true,
  //   });

  //   program.uniforms.uImageSizes.value = [image.width, image.height];

  //   this.plane = new Mesh(this.gl, {
  //     geometry: this.geometry,
  //     program,
  //   });

  //   this.plane.setParent(this.scene);
  // }

  createMesh() {
    const texture = new Texture(this.gl, {
      generateMipmaps: false,
    });

    // Create a canvas to render text
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const image = this.imageStore.loadedImages[this.textureIndex];

    // Set canvas size to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    // Add text on top of the image
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const text = `Card ${this.textureIndex + 1}`;
    ctx.fillText(text, canvas.width / 2, 20);

    // Use the canvas as a texture
    texture.image = canvas;

    const program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [image.width, image.height] },
        uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
        uStrength: { value: 0 },
      },
      transparent: true,
    });

    program.uniforms.uImageSizes.value = [image.width, image.height];

    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program,
    });

    this.plane.setParent(this.scene);
  }

  updateTextureIndex(direction) {
    if (direction === "down") {
      // When moving up, get the next texture in sequence
      this.textureIndex = (this.textureIndex + 12) % this.totalTextures;
    } else if (direction === "up") {
      // When moving down, get the previous texture in sequence
      this.textureIndex =
        (this.textureIndex - 12 + this.totalTextures) % this.totalTextures;
    }
    this.updateTexture(this.textureIndex);
  }

  // updateTexture(textureIndex) {
  //   const image = this.imageStore.loadedImages[textureIndex];

  //   this.plane.program.uniforms.tMap.value.image = image;
  //   this.plane.program.uniforms.tMap.value.needsUpdate = true;
  // }

  updateTexture(textureIndex) {
    const image = this.imageStore.loadedImages[textureIndex];

    // Create a canvas for the updated texture
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image and text on the canvas
    ctx.drawImage(image, 0, 0);
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const text = `Card ${textureIndex + 1}`;
    ctx.fillText(text, canvas.width / 2, 20);

    // Update the texture with the new canvas
    this.plane.program.uniforms.tMap.value.image = canvas;
    this.plane.program.uniforms.tMap.value.needsUpdate = true;
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
  }

  updateScale() {
    this.plane.scale.x =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    this.plane.scale.y =
      (this.viewport.height * this.bounds.height) / this.screen.height;
  }

  updateX(x = 0) {
    this.plane.position.x =
      -(this.viewport.width / 2) +
      this.plane.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  updateY(y = 0) {
    this.plane.position.y =
      this.viewport.height / 2 -
      this.plane.scale.y / 2 -
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height -
      this.extra;
  }

  update(y, direction) {
    this.updateScale();
    this.updateX();
    this.updateY(y.current);

    const planeOffset = this.plane.scale.y / 2;
    const viewportOffset = this.viewport.height / 2;

    this.isBefore = this.plane.position.y + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.y - planeOffset > viewportOffset;

    if (direction === "up" && this.isBefore) {
      this.extra -= this.height;
      // Update texture when card moves to new position
      this.updateTextureIndex("up");
      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === "down" && this.isAfter) {
      this.extra += this.height;
      // Update texture when card moves to new position
      this.updateTextureIndex("down");
      this.isBefore = false;
      this.isAfter = false;
    }

    this.plane.program.uniforms.uStrength.value =
      ((y.current - y.last) / this.screen.width) * 10;
  }
  onResize(sizes) {
    this.extra = 0;

    if (sizes) {
      const { height, screen, viewport } = sizes;

      if (height) this.height = height;
      if (screen) this.screen = screen;
      if (viewport) {
        this.viewport = viewport;

        this.plane.program.uniforms.uViewportSizes.value = [
          this.viewport.width,
          this.viewport.height,
        ];
      }
    }

    this.createBounds();
  }
};
