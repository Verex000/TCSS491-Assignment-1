

//#region Animation
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
//#endregion


function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    // this.game = game;
    // this.ctx = game.ctx;
    Entity.call(this, game, 0, 0);
}
Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
};
Background.prototype.draw = function (ctx) {
    ctx.drawImage(this.spritesheet,
                   this.x, this.y);
    Entity.prototype.draw.call(this);
};

function Spike(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/traps.png"), 12, 62, 32, 32, 0.3, 1, true, true);
    this.radius = 64;
    this.ground = 462;
    Entity.call(this, game, 20, 20);
}

Spike.prototype = new Entity();
Spike.prototype.constructor = Spike;
Spike.prototype.update = function() {
    if(this.y < 450) {
        this.y = this.y + 1;
    }
    Entity.prototype.update.call(this);
}

Spike.prototype.draw = function(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);

}

function Turkey(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/turkey.png"), 0, 0, 64, 64, 1, 1, true, true);
    this.radius = 64;
    this.ground = 462;
    Entity.call(this, game, 200, 100);
}

Turkey.prototype = new Entity();
Turkey.prototype.constructor = Turkey;

Turkey.prototype.update = function() {
    Entity.prototype.update.call(this);
}

Turkey.prototype.draw = function(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Slime(game) {
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/slimeEnemy.png"), 0, 0, 64, 64, 0.2, 5, false, true);
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/slimeEnemy.png"), 0, 64, 64, 64, 0.3, 3, true, true);
    this.walkRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/slimeEnemy.png"), 192, 64, 64, 64, 0.3, 3, true, true);
    this.jumping = false;
    this.speed = 100;
    this.radius = 64;
    this.ground = 450;
    this.walkLeft = true;
    this.walkRight = false; 
    this.jumpTime = 0;
    Entity.call(this, game, 300, 450);
}

Slime.prototype = new Entity();
Slime.prototype.constructor = Slime;

Slime.prototype.update = function() {
    if(this.jumpTime >= 100) {
        console.log("yeet");
        this.jumping = true;
    }
    if(this.jumping) {
        if(this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 20;
        if (jumpDistance > 0.5) {
            jumpDistance = 1 - jumpDistance;
        }
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
        this.jumpTime = 0;
        if(this.walkLeft) {
            this.x -= this.game.clockTick * this.speed;
            if(this.x <= 100) {
                this.walkLeft = false;
                this.walkRight = true;
            }
        }
        else {
            this.x += this.game.clockTick * this.speed;
            if(this.x >= 700) {
                this.walkRight = false;
                this.walkLeft = true;
            }
        }
    }
    else {


        if(this.walkLeft) {
            this.x -= this.game.clockTick * this.speed;
            if(this.x <= 100) {
                this.walkLeft = false;
                this.walkRight = true;
            }
        }
        else {
            this.x += this.game.clockTick * this.speed;
            if(this.x >= 700) {
                this.walkRight = false;
                this.walkLeft = true;
            }
        }
        this.jumpTime++;

    }
    Entity.prototype.update.call(this);

}

Slime.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        if(this.walkLeft) {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        else {
            this.walkRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    Entity.prototype.draw.call(this);
}

function Bat(game) {
    this.flyRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/bat.png"), 0, 32, 32, 32, 0.05, 4, true, true);
    this.flyLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/bat.png"), 0, 96, 32, 32, 0.05, 4, true, true);
    this.amplitude = 50;
    this.speed = 150;
    this.flyRight = true;
    Entity.call(this, game, 200, 400);
}

Bat.prototype = new Entity();
Bat.prototype.constructor = Bat;

Bat.prototype.update = function () {
    if(this.flyLeft) {
        //fly left
        this.x -= this.game.clockTick * this.speed;
        if(this.x <= 100) {
            this.flyLeft = false;
        }
    }
    else {
        //fly right
        this.x += this.game.clockTick * this.speed;
        if(this.x >= 700) {
            this.flyLeft = true;
        }
    }
    this.y = 200 - Math.sin(this.x / 25) * this.amplitude;

    Entity.prototype.update.call(this);
}

Bat.prototype.draw = function(ctx) {
    if(this.flyLeft) {
        this.flyLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.flyRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}


function Cuphead(game) {
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/cuphead.png"), 3, 113, 40, 30, 0.1, 4, false, true);
    this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("./img/cuphead.png"), 350, 0, 45, 55, 0.20, 3, true, true);
    this.jumping = false;
    this.radius = 60;
    this.ground = 440;
    this.jumpTime = 100;
    Entity.call(this, game, 0, 440);

}

Cuphead.prototype = new Entity();
Cuphead.prototype.constructor = Cuphead;

Cuphead.prototype.update = function() {
    if(this.jumping) {
        if(this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        let jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        let totalHeight = 100;
        if(jumpDistance > 0.5) {
            jumpDistance = 1 - jumpDistance;
        }

        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
        this.jumpTime = 0;
    }
    this.jumpTime++;
    if(this.jumpTime >= 250) {
        this.jumping = true;
    }
    Entity.prototype.update.call(this);

}

Cuphead.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else {
        this.idleAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

function Skeleton(game) {
    this.walkLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/skeleton.png"), 0, 0, 64, 64, 0.25, 4, true, true);
    this.walkRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/skeleton.png"), 0, 64, 64, 64, 0.25, 4, true, true);
    this.attackLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/skeleton.png"), 64, 192, 64, 64, 0.15, 3, false, true);
    this.attackRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/skeleton.png"), 0, 256, 64, 64, 0.15, 3, false, true);
    this.attacking = false;
    this.attackTime = 0;
    this.attackLeft = false;
    this.attackRight = true;
    this.walkLeft = false;
    this.walkRight = true;
    this.speed = 80;
    this.radius = 64;
    this.ground = 450;
    Entity.call(this, game, 300, 400);
}
Skeleton.prototype = new Entity();
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.update = function() {
    if(this.attackTime >= 100) {
        this.attacking = true;
    }
    if(this.attacking) {
        this.walkLeft ? this.attackLeft = true : this.attackRight = true;
        if(this.attackLeftAnimation.isDone() || this.attackRightAnimation.isDone()) {
            let bone = new SkeletonBone(this.game, this.x + 1, this.y + 5, this.walkRight);
            this.game.addEntity(bone);
            this.attackLeftAnimation.elapsedTime = 0;
            this.attackRightAnimation.elapsedTime = 0;
            this.attacking = false;
            this.attackTime = 0;
        }
    }
    else {
        if(this.walkLeft) {
            this.x -= this.game.clockTick * this.speed;
            if(this.x <= 100) {
                this.walkLeft = false;
                this.walkRight = true;
                this.attackRight = true;
                this.attackLeft = false;
            }
        }
        else {
            this.x += this.game.clockTick * this.speed;
            if(this.x >= 700) {
                this.walkRight = false;
                this.walkLeft = true;
                this.attackLeft = true;
                this.attackRight = false;
            }
        }
    }
    this.attackTime++;

    Entity.prototype.update.call(this);

}

Skeleton.prototype.draw = function(ctx) {
    if(this.attacking) {
        if(this.attackLeft) {
            this.attackLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        else {
            this.attackRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    else {
        if(this.walkLeft) {
            this.walkLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        else {
            this.walkRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }

    Entity.prototype.draw.call(this);

}

function SkeletonBone(game, skeletonX, skeletonY, direction) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/skeleton.png"), 192, 256, 64, 64, 0.2, 3, true, true);
    this.speed = 300;
    this.ground = 450;
    this.radius = 16;
    this.direction = direction;
    Entity.call(this, game, skeletonX, skeletonY);
}

SkeletonBone.prototype = new Entity();
SkeletonBone.prototype.constructor = SkeletonBone;

SkeletonBone.prototype.update = function() {
    if(this.y >= this.ground) {
        this.removeFromWorld = true;
    }
    if(this.x > 1200 || this.x < 0) {
        this.removeFromWorld = true;
    }

    let deltaX = this.animation.elapsedTime / this.animation.totalTime;
    let totalHeight = this.y + 10;

    let deltaY = totalHeight * (-4 * (deltaX * deltaX - deltaX));
    this.y = this.ground - deltaY;
    if(this.direction) {
        this.x += this.game.clockTick * this.speed;
    }
    else {
        this.x -= this.game.clockTick * this.speed;
    }
    Entity.prototype.update.call(this);
}

SkeletonBone.prototype.draw = function(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
}

function Chest(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/chest.png"), 0, 0, 64, 64, 0.25, 6, true, false);
    this.ground = 450;
    this.radius = 64;
    this.open = false;
    Entity.call(this, game, 400, 400);
}

Chest.prototype = new Entity();
Chest.prototype.constructor = Chest;

Chest.prototype.update = function() {
    Entity.prototype.update.call(this)
}

Chest.prototype.draw = function(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
}



// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/bat.png");
ASSET_MANAGER.queueDownload("./img/turkey.png");
ASSET_MANAGER.queueDownload("./img/slimeEnemy.png");
ASSET_MANAGER.queueDownload("./img/traps.png");
ASSET_MANAGER.queueDownload("./img/streetfighterBackground.png");
ASSET_MANAGER.queueDownload("./img/cuphead.png");
ASSET_MANAGER.queueDownload("./img/skeleton.png");
ASSET_MANAGER.queueDownload("./img/chest.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine, ASSET_MANAGER.getAsset("./img/streetfighterBackground.png"));
    var spike = new Spike(gameEngine);
    var slime = new Slime(gameEngine);
    var turkey = new Turkey(gameEngine);
    var bat = new Bat(gameEngine);
    var cuphead = new Cuphead(gameEngine);
    var skeleton = new Skeleton(gameEngine);
    var chest = new Chest(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(slime);
    gameEngine.addEntity(spike);
    gameEngine.addEntity(turkey);
    gameEngine.addEntity(bat);
    gameEngine.addEntity(cuphead);
    gameEngine.addEntity(skeleton);
    gameEngine.addEntity(chest);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
//#endregion