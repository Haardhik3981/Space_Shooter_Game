let player;
let cursors;
let bullets;
let enemies;
let score = 0;
let scoreText;
let highScore = localStorage.getItem('spaceShooterHighScore') || 0;
let enemyTimer;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('laser', 'assets/laser.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.audio('explode', 'assets/explosion.wav');
}

function create() {
  score = 0;

  player = this.physics.add.sprite(400, 550, 'player').setScale(0.15);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();

  bullets = this.physics.add.group({
    defaultKey: 'laser',
    maxSize: 20
  });

  enemies = this.physics.add.group();

  enemyTimer = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: spawnEnemy,
    callbackScope: this
  });

  this.input.keyboard.on('keydown-SPACE', () => {
    fireLaser.call(this);
  });

  this.input.keyboard.on('keydown-ESC', () => {
    exitGame.call(this);
  });

  this.physics.add.overlap(bullets, enemies, destroyEnemy, null, this);
  this.physics.add.overlap(player, enemies, hitPlayer, null, this);

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#fff'
  });

  this.highScoreText = this.add.text(16, 46, `High Score: ${highScore}`, {
    fontSize: '20px',
    fill: '#999'
  });

  this.explodeSound = this.sound.add('explode');
  // Bring text to top
scoreText.setDepth(1);
this.highScoreText.setDepth(1);

}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }
}

function fireLaser() {
  const bullet = bullets.get(player.x, player.y - 20);
  bullet.setScale(0.15);
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    bullet.setVelocityY(-500);
    bullet.setCollideWorldBounds(false);
    bullet.once('update', () => {
      if (bullet.y < 0) bullets.killAndHide(bullet);
    });
  }
}

function spawnEnemy() {
  const x = Phaser.Math.Between(50, 750);
  const enemy = enemies.create(x, 0, 'enemy').setScale(0.15);
  enemy.setVelocityY(100);
}

function destroyEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
  score += 10;
  scoreText.setText('Score: ' + score);
  this.explodeSound.play();
}

function hitPlayer(player, enemy) {
  this.physics.pause();
  enemyTimer.remove();
  player.setTint(0xff0000);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('spaceShooterHighScore', highScore);
  }

  this.add.text(400, 200, 'Game Over', {
    fontSize: '48px',
    fill: '#ff0000'
  }).setOrigin(0.5);

  showRestartButton.call(this);
  player.setVisible(false);
enemy.destroy();

}

function exitGame() {
  this.physics.pause();
  enemyTimer.remove();
  bullets.clear(true, true);
  enemies.clear(true, true);
  player.setVisible(false);

  this.add.text(400, 200, 'Thanks for playing!', {
    fontSize: '32px',
    fill: '#fff'
  }).setOrigin(0.5);

  showRestartButton.call(this);
}

function showRestartButton() {
  const restartButton = this.add.text(400, 300, 'Click to Restart', {
    fontSize: '28px',
    fill: '#ff0000',
    backgroundColor: '#ffffff',
    padding: { x: 10, y: 10 }
  });
  restartButton.setOrigin(0.5);
  restartButton.setInteractive();
  restartButton.on('pointerdown', () => {
    this.scene.restart();
  });
}
