import Editor from "./Editor.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 608,
  parent: "Game",
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [Editor],
};

const game = new Phaser.Game(config);
