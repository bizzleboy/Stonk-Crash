const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let x = 0;
let y = canvas.height;
let t = 0;
let speed = 0.5;
let trail = [];
let canvasZoom = 1;
let isDrawing = false;
let userMoney = 1000;
let canBust = false;

let htmlMoney = document.getElementById("money");
htmlMoney.textContent = userMoney;
let betSize = 0;

const betButton = document.getElementById("betButton");
const stopButton = document.getElementById("stopButton");

stopButton.style.visibility = "hidden";

function crash_line() {
  if (isDrawing && canBust) {
    isDrawing = false;
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("BUSTED", canvas.width / 2, canvas.height / 2);
    multiplier = 1;
  }
}

function bet() {
  if (isNaN(betSize) || betSize <= 0) {
    alert("Invalid bet size!");
    return;
  }

  if (betSize > userMoney) {
    alert("You're broke!");
    return;
  }

  userMoney -= betSize;
  htmlMoney.textContent = Math.round(userMoney);

  // Reset canvas and start drawing
  reset();
  isDrawing = true;
  drawLine();
}

function reset() {
  x = 0;
  y = canvas.height;
  t = 0;
  speed = 0.5;
  trail = [];
  canvasZoom = 1;
  isDrawing = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let htmlMult = document.getElementById("multiplier");
console.log(htmlMult);

let multiplier = 1;
let timeElapsed = 0;

function computeMultiplier() {
  timeElapsed += 1;
  const growthFactor = 0.0005;
  const growthRate = Math.exp(growthFactor * timeElapsed);
  const growthAmount = 0.001 * growthRate;
  multiplier += growthAmount;
  return multiplier.toPrecision(3);
}

function drawLine() {
  if (!isDrawing) {
    console.log("done");
    return;
  }

  stopButton.style.visibility = "visible";
  betButton.style.visibility = "hidden";

  canBust = true;

  // Calculate canvas dimensions based on line position and zoom level
  const canvasWidth = canvas.width * canvasZoom;
  const canvasHeight = canvas.height * canvasZoom;
  const canvasOffsetX = (canvas.width - canvasWidth) / 2;
  const canvasOffsetY = (canvas.height - canvasHeight) / 2;

  // Check if the line has gone beyond the current canvas dimensions
  const lineBounds = {
    left: x < canvasOffsetX,
    right: x > canvasOffsetX + canvasWidth,
    top: y < canvasOffsetY,
    bottom: y > canvasOffsetY + canvasHeight,
  };

  if (
    lineBounds.left ||
    lineBounds.right ||
    lineBounds.top ||
    lineBounds.bottom
  ) {
    // Update canvas zoom level
    canvasZoom = Math.max(
      canvasZoom,
      2 *
        Math.max(
          Math.abs(x - canvasOffsetX - canvasWidth / 2) / canvasWidth,
          Math.abs(y - canvasOffsetY - canvasHeight / 2) / canvasHeight
        )
    );
  }

  // Draw trailing lines
  trail.push({ x: x, y: y });
  if (trail.length > 50) {
    trail.shift();
  }
  ctx.beginPath();
  for (let i = 0; i < trail.length; i++) {
    const trailX = (trail[i].x - canvasOffsetX) / canvasZoom;
    const trailY = (trail[i].y - canvasOffsetY) / canvasZoom;
    ctx.lineTo(trailX, trailY);
  }
  ctx.lineWidth = 10 / canvasZoom;
  ctx.strokeStyle = "#ccc";
  ctx.stroke();

  // Draw current line
  ctx.beginPath();
  const lineStartX = (x - canvasOffsetX) / canvasZoom;
  const lineStartY = (y - canvasOffsetY) / canvasZoom;
  x += t * speed;
  y -= Math.pow(t, 1.3) * speed;
  const lineEndX = (x - canvasOffsetX) / canvasZoom;
  const lineEndY = (y - canvasOffsetY) / canvasZoom;
  ctx.moveTo(lineStartX, lineStartY);
  ctx.lineTo(lineEndX, lineEndY);
  ctx.lineWidth = 5 / canvasZoom;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  t += 0.002;

  htmlMult.textContent = computeMultiplier();

  if (Math.random() < 0.005 && canBust) {
    stopButton.style.visibility = "hidden";
    betButton.style.visibility = "visible";
    crash_line();
  }

  if (speed < 20) {
    speed += 0.005;
  }

  requestAnimationFrame(drawLine);
}

betButton.addEventListener("click", () => {
  betSize = parseInt(document.getElementById("bet").value);
  console.log(betSize);
  bet();
});

stopButton.addEventListener("click", () => {
  isDrawing = false;
  canBust = false;
  stopButton.style.visibility = "hidden";

  clearTimeout();
  console.log(multiplier);
  userMoney += betSize * multiplier;

  htmlMoney.textContent = Math.round(userMoney);

  multiplier = 1;
  betButton.style.visibility = "visible";
});
