import { makeNPC } from "../entities/npc.js";
import { makePlayer } from "../entities/player.js";
import { makeTiledMap } from "../entities/map.js";
import { makeDialogBox } from "../entities/dialogBox.js";
import { makeCamera } from "../entities/camera.js";
import { BRAINROTS } from "./battle.js";

export function makeWorld(p, setScene) {
  return {
    camera: makeCamera(p, 100, 0),
    player: makePlayer(p, 0, 0),
    npc: makeNPC(p, 0, 0),
    map: makeTiledMap(p, 100, -150),
    dialogBox: makeDialogBox(p, 0, 280),
    makeScreenFlash: false,
    alpha: 0,
    blinkBack: false,
    easing: 3,
    encounterCooldown: 1200,
    isStartingEncounter: false,
    houses: [
      { x: 7 * 32, y: 4 * 32, w: 5 * 32, h: 4 * 32, roof: "#d64f4f", door: "Casa Meme" },
      { x: 18 * 32, y: 4 * 32, w: 5 * 32, h: 4 * 32, roof: "#3f8cff", door: "Casa Tralala" },
      { x: 20 * 32, y: 15 * 32, w: 6 * 32, h: 4 * 32, roof: "#9b5cff", door: "Lab Brainrot" },
    ],
    load() {
      this.dialogBox.load();
      this.map.load("./assets/Trainer Tower interior.png", "./maps/world.json");
      this.player.load();
      this.npc.load();
    },
    setup() {
      this.map.prepareTiles();
      const spawnPoints = this.map.getSpawnPoints();
      for (const spawnPoint of spawnPoints) {
        switch (spawnPoint.name) {
          case "player":
            this.player.x = this.map.x + spawnPoint.x;
            this.player.y = this.map.y + spawnPoint.y + 32;
            break;
          case "npc":
            this.npc.x = this.map.x + spawnPoint.x;
            this.npc.y = this.map.y + spawnPoint.y + 32;
            break;
          default:
        }
      }
      this.player.setup();
      this.camera.attachTo(this.player);
      this.npc.setup();
    },
    isPlayerMoving() {
      const touch = window.__brainrotInput || {};
      return p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(p.UP_ARROW) || p.keyIsDown(p.DOWN_ARROW) || touch.ArrowRight || touch.ArrowLeft || touch.ArrowUp || touch.ArrowDown;
    },
    playerCenterMapPos() {
      return {
        x: this.player.x - this.map.x + 16,
        y: this.player.y - this.map.y + 16,
      };
    },
    isInGrass() {
      const pos = this.playerCenterMapPos();
      return this.map.getObjects("GrassPatches").some((patch) => (
        pos.x >= patch.x && pos.x <= patch.x + patch.width && pos.y >= patch.y && pos.y <= patch.y + patch.height
      ));
    },
    async startWildEncounter() {
      if (this.isStartingEncounter) return;
      this.isStartingEncounter = true;
      const wild = BRAINROTS[Math.floor(Math.random() * BRAINROTS.length)];
      window.__nextWildBrainrot = wild;
      this.dialogBox.displayText(`Something is moving in the tall grass...\nWild ${wild.name}!`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.dialogBox.setVisibility(false);
        this.makeScreenFlash = true;
        await new Promise((resolve) => setTimeout(resolve, 650));
        this.makeScreenFlash = false;
        this.isStartingEncounter = false;
        this.encounterCooldown = 2500;
        setScene("battle");
      });
      this.dialogBox.setVisibility(true);
    },
    update() {
      this.camera.update();
      this.player.update();
      this.npc.update();
      this.dialogBox.update();
      this.encounterCooldown = Math.max(0, this.encounterCooldown - p.deltaTime);
      if (!this.dialogBox.isVisible && this.encounterCooldown <= 0 && this.isPlayerMoving() && this.isInGrass()) {
        if (Math.random() < 0.012) this.startWildEncounter();
      }
      if (this.alpha <= 0) this.blinkBack = true;
      if (this.alpha >= 255) this.blinkBack = false;
      if (this.blinkBack) this.alpha += 0.7 * this.easing * p.deltaTime;
      else this.alpha -= 0.7 * this.easing * p.deltaTime;
    },
    drawGrass(camera) {
      p.push();
      for (const patch of this.map.getObjects("GrassPatches")) {
        const x = this.map.x + patch.x + camera.x;
        const y = this.map.y + patch.y + camera.y + 32;
        p.noStroke();
        p.fill(38, 150, 72);
        p.rect(x, y, patch.width, patch.height);
        p.fill(72, 204, 103);
        for (let gx = 0; gx < patch.width; gx += 12) {
          for (let gy = 0; gy < patch.height; gy += 14) {
            p.rect(x + gx + 3, y + gy + 5, 3, 9);
            p.rect(x + gx + 7, y + gy + 2, 3, 12);
          }
        }
      }
      p.pop();
    },
    drawTown(camera) {
      p.push();
      for (const house of this.houses) {
        const x = this.map.x + house.x + camera.x;
        const y = this.map.y + house.y + camera.y + 32;
        p.noStroke();
        p.fill(house.roof);
        p.rect(x - 8, y, house.w + 16, 28);
        p.fill("#f5d7a1");
        p.rect(x, y + 28, house.w, house.h - 28);
        p.fill("#8b4b2b");
        p.rect(x + house.w / 2 - 14, y + house.h - 34, 28, 34);
        p.fill("#7ed7ff");
        p.rect(x + 18, y + 48, 24, 20);
        p.rect(x + house.w - 42, y + 48, 24, 20);
        p.fill(255);
        p.textSize(10);
        p.text(house.door, x + 10, y + house.h + 14);
      }
      p.pop();
    },
    draw() {
      p.clear();
      p.background(0);
      this.npc.handleCollisionsWith(this.player, () => {
        this.dialogBox.displayText("I smell fresh brainrot energy.\nWalk in the tall grass for wild spawns!", async () => {
          await new Promise((resolve) => setTimeout(resolve, 700));
          this.dialogBox.setVisibility(false);
        });
        this.dialogBox.setVisibility(true);
      });
      this.map.draw(this.camera, this.player);
      this.drawGrass(this.camera);
      this.drawTown(this.camera);
      this.npc.draw(this.camera);
      this.player.draw(this.camera);
      this.dialogBox.draw();
      if (this.makeScreenFlash) {
        p.fill(0, 0, 0, this.alpha);
        p.rect(0, 0, 512, 384);
      }
    },
    keyReleased() {
      for (const key of [p.RIGHT_ARROW, p.LEFT_ARROW, p.UP_ARROW, p.DOWN_ARROW]) {
        if (p.keyIsDown(key)) return;
      }
      switch (this.player.direction) {
        case "up": this.player.setAnim("idle-up"); break;
        case "down": this.player.setAnim("idle-down"); break;
        case "left":
        case "right": this.player.setAnim("idle-side"); break;
        default:
      }
    },
  };
}
