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

    // Criação do objeto 'fantasma'
    this.ghostObject = this.add.sprite(0, 0, null);
    this.ghostObject.visible = false;

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
    const saveMapButton = document.getElementById("saveMapButton");

    terrainTile.addEventListener("click", () => {
      this.selectedTile = "terrain";
    });

    collisionTile.addEventListener("click", () => {
      this.selectedTile = "collision";
    });

    deleteTile.addEventListener("click", () => {
      this.selectedTile = "delete";
    });

    saveMapButton.addEventListener("click", () => {
      this.saveMap();
    });

    objectTiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        this.selectedTile = "object-" + tile.dataset.tile;
      });
    });

    this.objectUnderPointer = null;

    this.input.on(
      "pointerdown",
      function (pointer) {
        let worldPoint = pointer.positionToCamera(this.cameras.main);
        let pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        let tile = this.map.getTileAt(pointerTileXY.x, pointerTileXY.y);

        if (this.selectedTile === "delete") {
          if (this.objectUnderPointer) {
            this.objectsGroup.remove(this.objectUnderPointer, true, true);
            this.objectUnderPointer = null;
          } else if (tile) {
            this.map.removeTileAt(pointerTileXY.x, pointerTileXY.y);
          }
        } else if (this.selectedTile.startsWith("object-")) {
          let objectId = this.selectedTile;
          let objectWidth = objectDimensions[objectId].width;
          let objectHeight = objectDimensions[objectId].height;
          let objectX = pointer.worldX - objectWidth / 2;
          let objectY = pointer.worldY - objectHeight / 2;
          let object = this.objectsGroup.create(objectX, objectY, objectId);
          object.setOrigin(0, 0);

          this.ghostObject.visible = false;
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
        let worldPoint = pointer.positionToCamera(this.cameras.main);

        this.ghostObject.x = worldPoint.x;
        this.ghostObject.y = worldPoint.y;

        if (this.selectedTile && this.selectedTile.startsWith("object-")) {
          this.ghostObject.setTexture(this.selectedTile);
          this.ghostObject.visible = true;
          this.children.bringToTop(this.ghostObject);
        } else {
          this.ghostObject.visible = false;
        }

        // Track object under pointer
        this.objectUnderPointer = null;
        let objects = this.objectsGroup.getChildren();
        for (let i = 0; i < objects.length; i++) {
          if (objects[i].getBounds().contains(pointer.x, pointer.y)) {
            this.objectUnderPointer = objects[i];
            break;
          }
        }

        if (!pointer.isDown) {
          return;
        }

        let pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);

        if (this.selectedTile === "delete") {
          this.map.removeTileAt(pointerTileXY.x, pointerTileXY.y);
        } else if (this.selectedTile.startsWith("object-")) {
          // do nothing
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
    let terrainTiles = this.terrainLayer
      .getTilesWithin(0, 0, this.map.width, this.map.height)
      .map((tile) => {
        return {
          index: tile.index,
          x: tile.x,
          y: tile.y,
        };
      });
    let collisionTiles = this.collisionLayer
      .getTilesWithin(0, 0, this.map.width, this.map.height)
      .map((tile) => {
        return {
          index: tile.index,
          x: tile.x,
          y: tile.y,
        };
      });

    let mapData = {
      width: this.map.width,
      height: this.map.height,
      tileWidth: this.map.tileWidth,
      tileHeight: this.map.tileHeight,
      terrain: terrainTiles,
      collision: collisionTiles,
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
    console.log(mapDataString);
  }
}
