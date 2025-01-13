import { Mesh, Program, Texture } from "ogl";
import fragment from "public/glsl/fragment.glsl";
import vertex from "public/glsl/vertex.glsl";

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
    this.image = this.element.querySelector("img");

    this.extra = 0;
    this.height = height;
    this.geometry = geometry;
    this.gl = gl;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.cardIndex = index;

    // Track the actual texture index (0-35) for this card
    this.textureIndex = index;
    // Total number of available textures
    this.totalTextures = 24;

    this.createMesh();
    this.createBounds();

    this.onResize();
  }

  createMesh() {
    const texture = new Texture(this.gl);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const image = new Image();
    // Use the correct texture index (0-35) instead of just the card index (0-11)
    image.src = `images/${this.textureIndex + 1}.png`;

    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);

      texture.image = canvas;
      program.uniforms.uImageSizes.value = [canvas.width, canvas.height];
    };

    const program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
        uStrength: { value: 0 },
      },
      transparent: true,
    });

    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program,
    });

    this.plane.setParent(this.scene);
  }

  updateTextureIndex(direction) {
    if (direction === "up") {
      // When moving up, get the next texture in sequence
      this.textureIndex = (this.textureIndex + 12) % this.totalTextures;
    } else if (direction === "down") {
      // When moving down, get the previous texture in sequence
      this.textureIndex =
        (this.textureIndex - 12 + this.totalTextures) % this.totalTextures;
    }
    this.updateTexture(this.textureIndex);
  }

  updateTexture(textureIndex) {
    const imageSrc = `images/${textureIndex + 1}.png`;

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);

      this.plane.program.uniforms.tMap.value.image = canvas;
      this.plane.program.uniforms.tMap.value.needsUpdate = true;
    };
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
