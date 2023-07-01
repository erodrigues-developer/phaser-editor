export default class Editor extends Phaser.Scene {
  constructor() {
    super("Editor");
  }

  preload() {
    this.load.image("terrain", "assets/tiles/terrain.png");
    this.load.image("collision", "assets/tiles/collision.png");
    this.load.image("collision-editor", "assets/tiles/collision-editor.png");

    let objectFiles = [
      "chairs/game-chair-2.png",
      "computers/desktop-0.png",
      "desks/cyberpunk-desk-0.png",
      "rugs/fancy-rug.png",
    ];

    for (let file of objectFiles) {
      let objectId = "object-" + file;
      this.load.image(objectId, "assets/objects/" + file);
    }
  }

  create() {
    this.selectedTile = null;
    this.map = this.make.tilemap({
      width: 800,
      height: 608,
      tileWidth: 32,
      tileHeight: 32,
    });
    let terrainTiles = this.map.addTilesetImage("terrain");
    let collisionTiles = this.map.addTilesetImage("collision");
    let collisionEditorTiles = this.map.addTilesetImage("collision-editor");

    this.terrainLayer = this.map.createBlankLayer("terrain", terrainTiles);
    this.collisionLayer = this.map.createBlankLayer(
      "collision",
      collisionTiles
    );
    this.collisionEditorLayer = this.map.createBlankDynamicLayer(
      "collision-editor",
      collisionEditorTiles
    );
    this.collisionEditorLayer.setCollision(3, true);

    this.objectsGroup = this.add.group();

    // Fills the map with the terrain tile and the border with collision tiles
    this.terrainLayer.fill(0, 0, 0, this.map.width, this.map.height);
    this.terrainLayer.setCollision(1, true);
    this.collisionLayer.fill(0, 0, 0, this.map.width, 1); // Top border
    this.collisionLayer.fill(0, 0, 1, 1, this.map.height - 2); // Left border
    this.collisionLayer.fill(
      0,
      this.map.width / this.map.tileWidth - 1,
      0,
      1,
      this.map.height / this.map.tileHeight
    ); // Right border
    this.collisionLayer.fill(
      0,
      0,
      this.map.height / this.map.tileHeight - 1,
      this.map.width / this.map.tileWidth,
      1
    ); // Bottom border
    this.collisionLayer.setCollision(2, true);

    let objectFiles = [
      "chairs/game-chair-2.png",
      "computers/desktop-0.png",
      "desks/cyberpunk-desk-0.png",
      "rugs/fancy-rug.png",
    ];

    let objectDimensions = {};

    for (let file of objectFiles) {
      let objectId = "object-" + file;
      let image = this.textures.get(objectId).getSourceImage();
      let width = image.width;
      let height = image.height;
      objectDimensions[objectId] = { width, height };
    }

    // Configura os eventos de clique para os tiles
    const terrainTile = document.getElementById("terrainTile");
    const collisionTile = document.getElementById("collisionTile");
    const deleteTile = document.getElementById("deleteTile");
    const objectTiles = document.querySelectorAll("#objectTiles .tile");

    terrainTile.addEventListener("click", () => {
      this.selectedTile = "terrain";
    });

    collisionTile.addEventListener("click", () => {
      this.selectedTile = "collision";
    });

    deleteTile.addEventListener("click", () => {
      this.selectedTile = "delete";
    });

    objectTiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        this.selectedTile = "object-" + tile.dataset.tile;
      });
    });

    this.input.on(
      "pointerdown",
      function (pointer) {
        let worldPoint = pointer.positionToCamera(this.cameras.main);
        let pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        let tile = this.map.getTileAt(pointerTileXY.x, pointerTileXY.y);

        if (this.selectedTile === "delete") {
          if (tile) {
            this.map.removeTileAt(pointerTileXY.x, pointerTileXY.y);
          }

          let object = this.objectsGroup.getAt(
            pointerTileXY.x,
            pointerTileXY.y
          );
          if (object) {
            this.objectsGroup.remove(object, true, true);
          }
        } else if (this.selectedTile.startsWith("object-")) {
          let objectId = this.selectedTile;
          let objectWidth = objectDimensions[objectId].width;
          let objectHeight = objectDimensions[objectId].height;
          let objectX = pointer.worldX - objectWidth / 2;
          let objectY = pointer.worldY - objectHeight / 2;
          let object = this.objectsGroup.create(objectX, objectY, objectId);
          object.setOrigin(0, 0);
          console.log({ objectWidth, objectHeight });
        } else if (this.selectedTile === "collision") {
          this.collisionEditorLayer.putTileAt(
            0,
            pointerTileXY.x,
            pointerTileXY.y
          );
        } else {
          this.map.putTileAt(
            this.selectedTile,
            pointerTileXY.x,
            pointerTileXY.y
          );
        }
      },
      this
    );

    this.input.on(
      "pointermove",
      function (pointer) {
        if (!pointer.isDown) {
          return;
        }

        let worldPoint = pointer.positionToCamera(this.cameras.main);
        let pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        let tile = this.map.getTileAt(pointerTileXY.x, pointerTileXY.y);

        if (this.selectedTile === "delete") {
          if (tile) {
            this.map.removeTileAt(pointerTileXY.x, pointerTileXY.y);
          }

          let object = this.objectsGroup.getAt(
            pointerTileXY.x,
            pointerTileXY.y
          );
          if (object) {
            this.objectsGroup.remove(object, true, true);
          }
        } else if (this.selectedTile.startsWith("object-")) {
          let objectId = this.selectedTile;
          let objectWidth = objectDimensions[objectId].width;
          let objectHeight = objectDimensions[objectId].height;
          let objectX = pointer.worldX - objectWidth / 2;
          let objectY = pointer.worldY - objectHeight / 2;
          let object = this.objectsGroup.create(objectX, objectY, objectId);
          object.setOrigin(0, 0);
          console.log({ objectWidth, objectHeight });
        } else if (this.selectedTile === "collision") {
          this.collisionEditorLayer.putTileAt(
            0,
            pointerTileXY.x,
            pointerTileXY.y
          );
        } else {
          this.map.putTileAt(
            this.selectedTile,
            pointerTileXY.x,
            pointerTileXY.y
          );
        }
      },
      this
    );

    // Set up number keys to select tiles
    this.input.keyboard.on("keydown", function (event) {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ZERO) {
        this.selectedTile = "delete";
      } else if (
        event.keyCode >= Phaser.Input.Keyboard.KeyCodes.ONE &&
        event.keyCode <= Phaser.Input.Keyboard.KeyCodes.NINE
      ) {
        this.selectedTile =
          event.keyCode - Phaser.Input.Keyboard.KeyCodes.ONE + 1;
      }
    });

    this.drawGrid();
  }

  drawGrid() {
    let graphics = this.add.graphics();

    graphics.lineStyle(1, 0xcccccc, 0.8);

    for (let i = 0; i < this.map.width; i += this.map.tileWidth) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, this.map.height);
    }

    for (let i = 0; i < this.map.height; i += this.map.tileHeight) {
      graphics.moveTo(0, i);
      graphics.lineTo(this.map.width, i);
    }

    graphics.strokePath();
  }

  saveMap() {
    let mapData = {
      width: this.map.width,
      height: this.map.height,
      tileWidth: this.map.tileWidth,
      tileHeight: this.map.tileHeight,
      terrain: this.terrainLayer.getTileDataArray(),
      collision: this.collisionLayer.getTileDataArray(),
      objects: [],
    };

    for (let object of this.objectsGroup.getChildren()) {
      let objectData = {
        type: object.texture.key,
        x: object.x,
        y: object.y,
      };

      if (object.isPortal) {
        objectData.destinationScene = object.destinationScene;
      }

      mapData.objects.push(objectData);
    }

    let mapDataString = JSON.stringify(mapData);
    fs.writeFileSync("userMap.json", mapDataString);
  }
}
