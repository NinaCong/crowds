function Peep(config) {
  var self = this;

  // Properties
  self.x = config.x;
  self.y = config.y;
  self.velocity = { x: 0, y: 0 };
  self.infected = !!config.infected;
  self.sim = config.sim;
  self.defaultRisk = config.defaultRisk;

  // Update:
  self.numFriends = 0;
  self.numInfectedFriends = 0;
  self.isPastThreshold = false;
  self.isMajority = false;
  var _faceFollow = 0.75 + Math.random() * 0.1;
  self.risk = Math.random();
  self.update = function() {
    // Friends connected... or infected
    var friends = self.sim.getFriendsOf(self);
    self.numFriends = friends.length;
    self.numInfectedFriends = 0;
    friends.forEach(function(friend) {
      if (friend.infected) self.numInfectedFriends++;
    });

    // Past threshold?
    // self.isPastThreshold = false;
    // if (self.sim.contagion == 0) {
    //   // simple
    //   if (self.numInfectedFriends > 0) self.isPastThreshold = true;
    // } else {
    //   // complex
    //   if (self.numFriends > 0) {
    //     var ratio = self.numInfectedFriends / self.numFriends;
    //     if (ratio >= self.sim.contagion - 0.0001) {
    //       // floating point errors
    //       self.isPastThreshold = true;
    //     }
    //   }
    // }

    // SPLASH: FORCE-DIRECTED
    if (self.sim.options.splash) {
      // Attract towards 0 (gravity increases slightly the further you get out)
      var gravity = getUnitVector({
        x: 0 - self.x,
        y: 0 - self.y
      });
      var gravityScale = getVectorLength(self) * 0.00012;
      if (self.sim.options.CONCLUSION) {
        gravityScale *= 2;
      }
      gravity = multiplyVector(gravity, gravityScale);
      self.velocity = addVectors(self.velocity, gravity);

      // If within the ring, push OUT.
      if (!self.sim.options.CONCLUSION) {
        var RADIUS = 325;
        var distanceFromCenter = getVectorLength(self);
        if (distanceFromCenter < RADIUS) {
          var forcePushOut = RADIUS - distanceFromCenter;
          forcePushOut *= 0.05;
          forcePushOut = Math.min(forcePushOut, 2); //cap
          var forceDirection = getUnitVector(self);
          var forceOut = multiplyVector(forceDirection, forcePushOut);
          self.velocity = addVectors(self.velocity, forceOut);
        }
      }

      // Hookes to Connected
      var k = 0.002;
      var hookesDistance = 140;
      var hookesTotalForce = { x: 0, y: 0 };
      friends.forEach(function(friend) {
        var fromTo = getVectorFromTo(self, friend);
        var d = getVectorLength(fromTo) - hookesDistance;
        var forceMagnitude = k * d;
        var force = multiplyVector(getUnitVector(fromTo), forceMagnitude);

        hookesTotalForce = addVectors(hookesTotalForce, force);
      });
      self.velocity = addVectors(self.velocity, hookesTotalForce);

      // Coulomb from Disconnected
      var c = -300;
      if (self.sim.options.CONCLUSION) {
        c = -400;
      }
      var coulombTotalForce = { x: 0, y: 0 };
      self.sim.peeps.forEach(function(peep) {
        if (peep == self) return; // not self
        if (friends.indexOf(peep) >= 0) return; // not a friend

        var fromTo = getVectorFromTo(self, peep);
        var d = getVectorLength(fromTo);
        var forceMagnitude = c / (d * d);
        var force = multiplyVector(getUnitVector(fromTo), forceMagnitude);

        coulombTotalForce = addVectors(coulombTotalForce, force);
      });
      self.velocity = addVectors(self.velocity, coulombTotalForce);

      // Travel Clockwise
      var spin = getUnitVector(self);
      spin = rotateVector(spin, Math.TAU / 4);
      spin = multiplyVector(spin, 0.02 * 0.25); // even less spin
      self.velocity = addVectors(self.velocity, spin);

      // Air Friction
      self.velocity = multiplyVector(self.velocity, 0.95);

      // Move
      self.x += self.velocity.x;
      self.y += self.velocity.y;
    }
  };

  // Body Sprite
  var _initSpriteScale = 0.3;
  self.sprite = new Sprite({
    img: "peeps",
    frames: 6,
    sw: 400,
    sh: 400
  });
  self.sprite.pivotX = 200;
  self.sprite.pivotY = 200;
  self.sprite.scale = _initSpriteScale;

  // Prop Sprite
  self.propSprite = new Sprite({
    img: "peeps",
    frames: 6,
    sw: 200,
    sh: 200
  });
  self.propSprite.pivotX = 100;
  self.propSprite.pivotY = 100;
  self.propSprite.scale = _initSpriteScale;
  var _bottleAnim = Math.random() * Math.TAU;
  var _bottleSpeed = 0.01 + Math.random() * 0.01;

  // Draw
  var radius = 25;
  var barWidth = radius * 2;
  var barHeight = 10;
  var bodyRotation = Math.TAU * Math.random();
  var PEEP_COLORS = [
    "#B4B4B4", // gray
    "#990115", // red
    "#FEE576", // yellow
    "#86F5FB", // blue
    "#7DE74E", // green
    "#FBCBDC" // pink
  ];
  var _glowAnim = 0;
  self.conclusionFrame = Math.floor(1 + Math.random() * 5);
  self.draw = function(ctx) {
    ctx.save();
    ctx.translate(self.x, self.y);

    var s;
    if ((s = self.sim.options.scale)) ctx.scale(s, s);

    // Circle
    var infectedFrame = self.sim.options.infectedFrame || 1;
    var infectedColor = PEEP_COLORS[infectedFrame];
    var myFrame = self.infected ? infectedFrame : 0;
    var myColor = PEEP_COLORS[myFrame];
    // CONCLUSION SPLASH
    if (self.sim.options.CONCLUSION) {
      var distance = getVectorLength(self);
      if (distance < self.sim.options.CONCLUSION_GLOW_RADIUS) {
        //self.isPastThreshold = true;
        myFrame = self.conclusionFrame;
        infectedFrame = self.conclusionFrame;
      }
    }
    self.sprite.rotation = bodyRotation;

    self.sprite.gotoFrame(myFrame);
    self.sprite.draw(ctx);

    // Face
    ctx.save();
    ctx.translate(self.faceX, self.faceY);
    self.sprite.rotation = 0;
    self.sprite.gotoFrame(self.faceBlink ? 7 : 6);
    if (self.sim.options._wisdom && self.infected) {
      self.sprite.gotoFrame(10);
    }
    if (self.sim.options._bottle && self.infected) {
      self.sprite.rotation = Math.sin(_bottleAnim * 1.5) * 0.15;
    }
    self.sprite.draw(ctx);
    ctx.restore();

    // PROPS?
    if (self.sim.options._bottle && self.infected) {
      self.propSprite.x = 25;
      self.propSprite.y = 15;
      _bottleAnim += _bottleSpeed;
      self.propSprite.scale = 0.25;
      self.propSprite.rotation = 0.2 + Math.sin(_bottleAnim) * 0.2;
      self.propSprite.gotoFrame(9);
      self.propSprite.draw(ctx);
    }
    if (self.sim.options._dunce && self.infected) {
      self.propSprite.x = -14;
      self.propSprite.y = -22;
      self.propSprite.scale = 0.25;
      self.propSprite.gotoFrame(8);
      self.propSprite.draw(ctx);
    }

    //////////////////////////////////////////////////////////
    // LABEL FOR INFECTED/FRIENDS, BAR, AND CONTAGION LEVEL //
    //////////////////////////////////////////////////////////

    // DON'T show bar if simple contagion
    if (self.sim.contagion > 0) {
      ctx.save();

      var bgColor = "#ddd";
      var uiColor = "#333";

      // Say: Infected/Friends (% then n/n)
      ctx.translate(0, -46);
      ctx.font = "12px PatrickHand";
      ctx.fillStyle = uiColor;
      ctx.textBaseline = "middle";
      ctx.fontWeight = "bold";
      if (self.numFriends > 0) {
        // %, centered
        ctx.textAlign = "center";
        var labelPercent = Math.round(100 * self.risk) + "%";
        ctx.fillText(labelPercent, 6, -12);

        /*
				// %
				ctx.textAlign = "left";
				var labelPercent = Math.round(100*(self.numInfectedFriends/self.numFriends)) + "%";
				ctx.fillText(labelPercent, -barWidth/2, 0);

				// #/#
				ctx.textAlign = "right";
				var labelNum = self.numInfectedFriends+"/"+self.numFriends;
				ctx.fillText(labelNum, barWidth/2, 0);
				*/
      } else {
        ctx.textAlign = "center";
        ctx.fillText("∅", 0, -1);
      }

      // the gray bg
      ctx.translate(5, 0);
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.rect(-barWidth / 2, -barHeight / 2, barWidth, barHeight);
      ctx.fill();

      // the color fill
      if (self.numFriends > 0) {
        ctx.fillStyle = infectedColor;
        ctx.beginPath();
        ctx.rect(
          -barWidth / 2,
          -barHeight / 2,
          barWidth * self.risk,
          barHeight
        );
        ctx.fill();
      }

      // a pointer for contagion level
      // ctx.translate(0, -barHeight / 2);
      // ctx.save();
      // ctx.translate(barWidth * 0.33 - barWidth / 2, 0);
      // ctx.lineCap = "butt";
      // ctx.strokeStyle = uiColor;
      // ctx.lineWidth = 1.5;
      // ctx.beginPath();
      // ctx.moveTo(0, -2);
      // ctx.lineTo(0, barHeight + 2);
      // ctx.stroke();
      // ctx.restore();

      ctx.restore();
    }

    ctx.restore();
  };

  // Hit Test
  self.hitTest = function(x, y, buffer) {
    // ACTUALLY IGNORE BUFFER'S AMOUNT, IT'S TRUE OR FALSE.
    // if(buffer===undefined) buffer=0;
    buffer = !!buffer;
    var dx = self.x - x;
    var dy = self.y - y;
    var dist2 = dx * dx + dy * dy;

    var r = radius;
    var s;
    if ((s = self.sim.options.scale)) r *= s;

    r = buffer ? Math.max(r + 10, 40) : r;

    return dist2 < r * r;
  };

  // Infect
  self.infect = function() {
    self.infected = true;
  };
}
