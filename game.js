gameState = {
    attackAnimCD: 0,
    attackCD: 0,
    score: 0,
    hasFailed: false
}

function preload() {
    this.load.spritesheet('player-idle', 'assets/Soldier_1/Idle.png', 
        { frameWidth: 128, frameHeight: 128})
    this.load.spritesheet('player-walk', 'assets/Soldier_1/Walk.png', 
        { frameWidth: 128, frameHeight: 128})
    this.load.spritesheet('player-attack', 'assets/Soldier_1/Shot_2.png', 
        { frameWidth: 128, frameHeight: 128})   
    this.load.spritesheet('enemy-1-walk', 'assets/Zombie Man/Walk.png', 
        { frameWidth: 96, frameHeight: 96})  
    this.load.spritesheet('enemy-1-run', 'assets/Zombie Man/Run.png', 
        { frameWidth: 96, frameHeight: 96})
    this.load.spritesheet('enemy-1-dead', 'assets/Zombie Man/Dead.png', 
        { frameWidth: 96, frameHeight: 96})
    this.load.spritesheet('enemy-2-walk', 'assets/Zombie Woman/Walk.png', 
        { frameWidth: 96, frameHeight: 96})  
    this.load.spritesheet('enemy-2-run', 'assets/Zombie Woman/Run.png', 
        { frameWidth: 96, frameHeight: 96})
    this.load.spritesheet('enemy-2-dead', 'assets/Zombie Woman/Dead.png', 
        { frameWidth: 96, frameHeight: 96})
    this.load.image('bg', 'assets/City1.png')
    this.load.audio('gunshot', 'assets/Audio/gunshot.wav')
    this.load.audio('grunt', 'assets/Audio/grunt.wav')
    this.load.audio('music', 'assets/Audio/Zombie Game Soundtrack.mp3')

}

function create() {
    this.cameras.main.setViewport(0, 0, 1280, 720)
    const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0)
    bg.setDisplaySize(1280, 720)
    gameState.player = this.physics.add.sprite(640, 360, 'player-idle')
    gameState.player.setScale(3)
    gameState.player.body.setSize(26, 128)
    gameState.player.body.setOffset(50, 0)
    gameState.floor = this.physics.add.staticGroup()
    gameState.floor.create(640, 650, 'floor').setVisible(false).setScale(45, 0.1).refreshBody();
    this.physics.add.collider(gameState.player, gameState.floor)

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player-idle'),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player-walk'),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'attack',
        frames: this.anims.generateFrameNumbers('player-attack'),
        frameRate: 20,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy-1-walk',
        frames: this.anims.generateFrameNumbers('enemy-1-walk'),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy-1-run',
        frames: this.anims.generateFrameNumbers('enemy-1-run'),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy-1-dead',
        frames: this.anims.generateFrameNumbers('enemy-1-dead'),
        frameRate: 7,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy-2-walk',
        frames: this.anims.generateFrameNumbers('enemy-2-walk'),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy-2-run',
        frames: this.anims.generateFrameNumbers('enemy-2-run'),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy-2-dead',
        frames: this.anims.generateFrameNumbers('enemy-2-dead'),
        frameRate: 7,
        repeat: -1
    })

    gameState.cursors = this.input.keyboard.addKeys('A,D,SPACE')

    const enemies = this.physics.add.group()
    gameState.enemies = enemies
    function makeEnemies() {
        if (enemies.getChildren().length >= 5) {
            return
        }
        const variant = Math.random() > 0.5 ? 2 : 1
        const xCoord = Math.random() > 0.5 ? 1380 : -100
        const speed = 50 + Math.random() * 100 + gameState.score / 2
        const isFast = speed >= 110
        const enemyAnim = isFast ? `enemy-${variant}-run` : `enemy-${variant}-walk`
        const enemy = enemies.create(xCoord, 400, enemyAnim)
        enemy.variant = variant
        enemy.isFast = isFast 
        enemy.setScale(3)
        enemy.body.setSize(30, 96)
        enemy.anims.play(enemyAnim, true)
        if (xCoord === 1380) {
            enemy.setVelocityX(-speed) 
            enemy.flipX = true
        } else {
            enemy.setVelocityX(speed)
        }
    }
    gameState.makeEnemiesLoop = this.time.addEvent({
        delay: 1500,
        callback: makeEnemies,
        callbackScope: this,
        loop: true
    })
    this.physics.add.collider(enemies, gameState.floor)
    this.physics.add.collider(enemies, gameState.player, () => {
        for (elem of [bg, enemies, gameState.player]) {
            elem.setTint(0x888888)
        }
        gameState.makeEnemiesLoop.destroy()
        this.physics.pause()
        gameState.hasFailed = true;
        const text = this.add.text(0, 0, 'Game Over!\nPress SPACE to restart', {fontSize: '20px', fill: '#000000', align: 'center', fontStyle: 'bold'})
        text.setX(this.cameras.main.width / 2 - text.width / 2);
        text.setY(this.cameras.main.height / 2 - text.height / 2);
        setTimeout(() => {
            this.input.keyboard.on('keydown-SPACE', () => {
                gameState.score = 0
                gameState.hasFailed = false
                this.scene.restart()
            })
        }, 1000);
        
    })
    gameState.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#000000', fontStyle: 'bold'});
    this.sound.stopAll()
    const music = this.sound.add('music')
    music.play({loop: true})
}

function update() {
    if (gameState.cursors.SPACE.isDown && !gameState.hasFailed) {
        if (gameState.attackCD == 0) {
            gameState.attackAnimCD = 15
            gameState.attackCD = 50
            gameState.player.setVelocityX(0)
            gameState.player.anims.play('attack', true)
            this.sound.play('gunshot')
        } 
    }
    if (gameState.attackAnimCD > 0) {
        gameState.attackAnimCD--
        if (gameState.attackAnimCD == 0) {
            let enemyHit = null
            gameState.enemies.getChildren().forEach(enemy => {
                if (gameState.player.flipX) {
                    if (enemy.x < gameState.player.x && (enemyHit === null || enemyHit.x < enemy.x) && enemy.x >= -5) {
                        enemyHit = enemy
                    }
                } else if (enemy.x > gameState.player.x && (enemyHit === null || enemyHit.x > enemy.x) && enemy.x <= 1285) {
                    enemyHit = enemy
                }
            })
            if (enemyHit) {
                enemyHit.setVelocityX(0)
                enemyHit.anims.play(`enemy-${enemyHit.variant}-dead`, true)
                this.sound.play('grunt', {seek: 0.1, rate: (enemyHit.variant == 1 ? 1 : 1.2) + (Math.random() - 0.5) / 3})
                enemyHit.setTint(0xbb9999)
                setTimeout(() => {
                    enemyHit.destroy()
                }, 700);
                
                gameState.score += enemyHit.isFast ? 3 : 2
                gameState.scoreText.setText(`Score: ${gameState.score}`)
                gameState.makeEnemiesLoop.delay = Math.max(700, 1500 - gameState.score * 3)
                
            }
        }
    }
    if (gameState.attackCD > 0) {
        gameState.attackCD--
    }
    if (gameState.attackAnimCD == 0 && !gameState.hasFailed) {
        let hasMoved = false
        if (gameState.cursors.A.isDown) {
            gameState.player.setVelocityX(-150)
            gameState.player.flipX = true
            hasMoved = true
        } 
        if (gameState.cursors.D.isDown) {
            gameState.player.setVelocityX(150)
            gameState.player.flipX = false
            hasMoved = true
        }
        if (!hasMoved) {
            gameState.player.setVelocityX(0)
            gameState.player.anims.play('idle', true)
        } else {
            gameState.player.anims.play('walk', true)
        }
    }
    
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: "555555",
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-example',
        width: 1280,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 1500 },
          enableBody: true,
          debug: false
        }
      },
    scene: {
        preload,
        create,
        update
    }
}

const game = new Phaser.Game(config)