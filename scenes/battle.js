import { makeDialogBox } from "../entities/dialogBox.js";

export const BRAINROTS = [
  {
    id: "STRAWBERRY_ELEPHANT",
    name: "STRAWBERRY ELEPHANT",
    asset: "assets/STRAWBERRY_ELEPHANT.svg",
    maxHp: 105,
    attacks: [
      { name: "BERRY STOMP", power: 18 },
      { name: "SEED SPRAY", power: 24 },
      { name: "JUICE TRUNK", power: 30 },
      { name: "LEAF FLEX", power: 16 },
    ],
  },
  {
    id: "TRALALERO_TRALALA",
    name: "TRALALERO TRALALA",
    asset: "assets/TRALALERO_TRALALA.svg",
    maxHp: 98,
    attacks: [
      { name: "SNEAKER DASH", power: 20 },
      { name: "SHARK BITE", power: 28 },
      { name: "TRALALA KICK", power: 25 },
      { name: "BLUE DRIP", power: 18 },
    ],
  },
  {
    id: "BONECA_AMBALABU",
    name: "BONECA AMBALABU",
    asset: "assets/BONECA_AMBALABU.svg",
    maxHp: 112,
    attacks: [
      { name: "TIRE ROLL", power: 22 },
      { name: "FROG STARE", power: 19 },
      { name: "AMBALABU RUN", power: 30 },
      { name: "RUBBER SLAP", power: 20 },
    ],
  },
  {
    id: "SKIBIDI_TOILET",
    name: "SKIBIDI TOILET",
    asset: "assets/SKIBIDI_TOILET.svg",
    maxHp: 100,
    attacks: [
      { name: "FLUSH BLAST", power: 24 },
      { name: "SKIBIDI GRIN", power: 17 },
      { name: "TOILET SPIN", power: 26 },
      { name: "VIRAL SCREAM", power: 21 },
    ],
  },
  {
    id: "BOMBARDIRO",
    name: "BOMBARDIRO",
    asset: "assets/BOMBARDIRO.svg",
    maxHp: 108,
    attacks: [
      { name: "AIR DROP", power: 25 },
      { name: "CROC CHOMP", power: 27 },
      { name: "MEME MISSILE", power: 31 },
      { name: "WING SLAP", power: 18 },
    ],
  },
];

const playerStarter = {
  ...BRAINROTS[0],
  name: "STRAWBERRY ELEPHANT",
  attacks: [
    { name: "BERRY STOMP", power: 22 },
    { name: "RIZZ BEAM", power: 28 },
    { name: "CATCH", power: 999, catchMove: true },
    { name: "SIGMA ROAR", power: 20 },
  ],
};

const states = {
  intro: "intro",
  playerTurn: "player-turn",
  npcTurn: "npc-turn",
  busy: "busy",
  battleEnd: "battle-end",
};

function cloneFighter(template, x, y, side) {
  return {
    ...template,
    x,
    y,
    side,
    hp: template.maxHp,
    spriteRef: null,
    selectedAttack: null,
    isFainted: false,
  };
}

export function makeBattle(p) {
  return {
    dialogBox: makeDialogBox(p, 0, 288),
    currentState: states.intro,
    wild: null,
    playerBrainrot: null,
    spriteCache: {},
    load() {
      this.battleBackgroundImage = p.loadImage("assets/battle-background.png");
      this.dialogBox.load();
    },
    setup() {
      this.start(window.__nextWildBrainrot || BRAINROTS[1]);
    },
    start(wildTemplate) {
      const wild = wildTemplate || BRAINROTS[Math.floor(Math.random() * BRAINROTS.length)];
      this.wild = cloneFighter(wild, 318, 46, "wild");
      this.playerBrainrot = cloneFighter(playerStarter, 28, 152, "player");
      this.currentState = states.intro;
      this.dialogBox.clearText();
      this.dialogBox.displayText(`A wild ${this.wild.name} appeared in the grass!`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        this.currentState = states.playerTurn;
      });
      this.dialogBox.setVisibility(true);
    },
    drawHealthBar(x, y, w, h, fighter) {
      const pct = Math.max(0, fighter.hp / fighter.maxHp);
      p.noStroke();
      p.fill(24, 24, 32);
      p.rect(x, y, w, h, 5);
      p.fill(pct > 0.5 ? "#3df57f" : pct > 0.22 ? "#ffd23f" : "#ff4d6d");
      p.rect(x + 2, y + 2, (w - 4) * pct, h - 4, 4);
      p.fill(255);
      p.textSize(12);
      p.text(`${Math.max(0, fighter.hp)}/${fighter.maxHp}`, x + w - 54, y + h + 13);
    },
    drawCard(fighter, x, y, alignRight = false) {
      p.push();
      p.noStroke();
      p.fill(12, 15, 28, 225);
      p.rect(x, y, 206, 62, 12);
      p.stroke(248, 236, 106);
      p.strokeWeight(2);
      p.noFill();
      p.rect(x, y, 206, 62, 12);
      p.noStroke();
      p.fill(255);
      p.textSize(15);
      p.textAlign(alignRight ? p.RIGHT : p.LEFT, p.TOP);
      p.text(fighter.name, alignRight ? x + 192 : x + 14, y + 8);
      this.drawHealthBar(x + 14, y + 31, 178, 12, fighter);
      p.pop();
    },
    drawPixelSprite(id, x, y, s = 5, flip = false) {
      const rects = {
        STRAWBERRY_ELEPHANT: [[8,7,15,12,"#e23d55"],[6,10,5,8,"#f0526a"],[21,10,4,7,"#c72e46"],[9,19,4,8,"#d73550"],[18,19,4,8,"#b9273d"],[5,14,4,7,"#df3f58"],[9,4,4,3,"#7dbb2f"],[13,3,3,4,"#8bd03a"],[16,4,5,3,"#6fa629"],[12,10,2,2,"#111827"],[19,10,2,2,"#111827"],[13,10,1,1,"#fff"],[20,10,1,1,"#fff"]],
        TRALALERO_TRALALA: [[5,12,17,6,"#2f5f8f"],[2,14,6,3,"#e9eef5"],[20,11,7,2,"#1d3657"],[25,9,2,6,"#1d3657"],[10,8,4,5,"#1f416d"],[7,16,4,7,"#2f5f8f"],[6,22,7,3,"#2998df"],[5,25,9,2,"#f4f8ff"],[19,17,4,7,"#2f5f8f"],[18,23,7,3,"#2998df"],[17,26,9,2,"#f4f8ff"],[7,13,1,1,"#05070d"]],
        BONECA_AMBALABU: [[8,11,14,14,"#111"],[10,13,10,10,"#2b2b2b"],[12,15,6,6,"#090909"],[7,6,16,7,"#2fa35f"],[9,4,5,4,"#3ebd73"],[18,4,5,4,"#3ebd73"],[8,10,15,3,"#d7c3a3"],[10,7,4,3,"#f7fbff"],[19,7,4,3,"#f7fbff"],[11,7,2,2,"#0c1722"],[20,7,2,2,"#0c1722"],[8,25,3,5,"#b87958"],[20,24,3,7,"#b87958"]],
        SKIBIDI_TOILET: [[10,15,14,10,"#f4f4f1"],[8,18,18,5,"#fff"],[11,24,11,4,"#ddd"],[13,13,9,3,"#6fc7ff"],[13,6,8,10,"#f0a760"],[12,4,10,3,"#1a1110"],[14,8,3,3,"#fff"],[19,8,3,3,"#fff"],[15,9,1,1,"#17a05f"],[20,9,1,1,"#17a05f"],[14,13,7,2,"#141414"],[15,14,5,1,"#fff1b0"]],
        BOMBARDIRO: [[7,10,15,7,"#6b8f47"],[4,12,6,4,"#d0d5b7"],[20,11,5,3,"#536f35"],[10,7,4,4,"#5f7d3f"],[14,17,3,8,"#855a35"],[18,17,3,8,"#855a35"],[13,24,5,2,"#3b2a1b"],[18,24,5,2,"#3b2a1b"],[8,13,1,1,"#0b0b0b"],[22,8,5,2,"#caa15a"]],
      }[id] || [];
      p.push();
      p.translate(x, y);
      if (flip) { p.scale(-1, 1); p.translate(-32 * s, 0); }
      p.noStroke();
      for (const [rx, ry, rw, rh, c] of rects) {
        p.fill(c);
        p.rect(rx * s, ry * s, rw * s, rh * s);
      }
      p.pop();
    },
    drawBattleMenu() {
      p.push();
      p.noStroke();
      p.fill(10, 11, 20, 242);
      p.rect(0, 288, 512, 96);
      p.stroke(61, 245, 193);
      p.strokeWeight(3);
      p.noFill();
      p.rect(8, 296, 496, 80, 12);
      p.noStroke();
      const moves = this.playerBrainrot.attacks;
      const boxes = [
        [24, 306], [268, 306], [24, 342], [268, 342],
      ];
      for (let i = 0; i < moves.length; i++) {
        const [x, y] = boxes[i];
        p.fill(moves[i].catchMove ? "#ffd23f" : "#2b355e");
        p.rect(x, y, 220, 28, 8);
        p.fill(moves[i].catchMove ? "#17110a" : "#ffffff");
        p.textSize(13);
        p.text(`${i + 1}) ${moves[i].name}`, x + 10, y + 18);
      }
      p.pop();
    },
    async dealDamage(target, attacker) {
      const move = attacker.selectedAttack;
      if (move.catchMove) {
        const catchChance = Math.min(0.85, 0.25 + (1 - target.hp / target.maxHp) * 0.75);
        if (Math.random() < catchChance) {
          target.hp = 0;
          target.isFainted = true;
          this.currentState = states.battleEnd;
          this.dialogBox.displayText(`${target.name} was caught!`, () => {});
          return;
        }
        this.dialogBox.displayText(`${target.name} broke free!`, () => {});
        return;
      }
      const damage = Math.max(8, Math.round(move.power * (0.85 + Math.random() * 0.3)));
      target.hp -= damage;
      if (target.hp <= 0) {
        target.hp = 0;
        target.isFainted = true;
        this.currentState = states.battleEnd;
      }
    },
    update() {
      this.dialogBox.update();
    },
    draw() {
      p.clear();
      p.background(14, 20, 34);
      if (this.battleBackgroundImage) p.image(this.battleBackgroundImage, 0, 0);
      p.noStroke();
      p.fill(61, 245, 193, 38);
      p.ellipse(382, 188, 190, 38);
      p.fill(255, 124, 207, 35);
      p.ellipse(118, 268, 210, 45);
      this.drawPixelSprite(this.wild.id, this.wild.x, this.wild.y, 5, false);
      this.drawPixelSprite(this.playerBrainrot.id, this.playerBrainrot.x, this.playerBrainrot.y, 5, true);
      this.drawCard(this.wild, 20, 20, false);
      this.drawCard(this.playerBrainrot, 286, 210, true);

      if (this.currentState === states.playerTurn && !this.playerBrainrot.selectedAttack) {
        this.drawBattleMenu();
      } else {
        p.rect(0, 288, 512, 96);
        this.dialogBox.draw();
      }

      if (this.currentState === states.playerTurn && this.playerBrainrot.selectedAttack) {
        const move = this.playerBrainrot.selectedAttack;
        this.currentState = states.busy;
        this.dialogBox.clearText();
        this.dialogBox.displayText(`${this.playerBrainrot.name} used ${move.name}!`, async () => {
          await this.dealDamage(this.wild, this.playerBrainrot);
          await new Promise((resolve) => setTimeout(resolve, 650));
          if (this.currentState === states.battleEnd) return;
          this.wild.selectedAttack = this.wild.attacks[Math.floor(Math.random() * this.wild.attacks.length)];
          this.currentState = states.npcTurn;
        });
      }

      if (this.currentState === states.npcTurn && !this.wild.isFainted) {
        const move = this.wild.selectedAttack;
        this.currentState = states.busy;
        this.dialogBox.clearText();
        this.dialogBox.displayText(`Wild ${this.wild.name} used ${move.name}!`, async () => {
          await this.dealDamage(this.playerBrainrot, this.wild);
          await new Promise((resolve) => setTimeout(resolve, 650));
          if (this.currentState !== states.battleEnd) {
            this.playerBrainrot.selectedAttack = null;
            this.wild.selectedAttack = null;
            this.currentState = states.playerTurn;
          }
        });
      }

      if (this.currentState === states.battleEnd) {
        if (this.wild.isFainted) {
          this.dialogBox.displayText(`${this.wild.name} joined your brainrot dex!`);
        } else if (this.playerBrainrot.isFainted) {
          this.dialogBox.displayText(`${this.playerBrainrot.name} got ratio'd!`);
        }
      }
    },
    onKeyPressed(keyEvent) {
      if (this.currentState !== states.playerTurn || this.playerBrainrot.selectedAttack) return;
      const idx = Number(keyEvent.key) - 1;
      if (idx >= 0 && idx < this.playerBrainrot.attacks.length) {
        this.playerBrainrot.selectedAttack = this.playerBrainrot.attacks[idx];
      }
    },
  };
}
