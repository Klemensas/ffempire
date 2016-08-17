let pos = {
  y: 0,
  x: 0
};
let screen = [800, 450];


const parent = document.getElementById('test');
const canvas = document.createElement('canvas');
canvas.setAttribute('width', `${screen[0]}px`);
canvas.setAttribute('height', `${screen[1]}px`);
canvas.setAttribute('style', 'border: 1px solid black');
parent.appendChild(canvas);
const ctx = canvas.getContext('2d');

ctx.fillStyle = "#ff0000";
ctx.strokeStyle = "#000000";
ctx.font = "24px serif";
ctx.lineWidth = 0;

setTimeout(initMap, 0, ctx, screen, pos);

function initMap(ctx, screen, pos) {
  const width = screen[0] / 9;
  const side = width / Math.sqrt(3);
  const height = 2 * side;
  const radius = width / 2;
  const aHeight = height * 0.75;
  const hexHeight = side / 2;
  const imgs = [
    'assets/images/map/grass.png',
    'assets/images/map/grass2.png',
    'assets/images/map/grass3.png',
    'assets/images/map/grass4.png',
    'assets/images/map/grass5.png',
    'assets/images/map/grass6.png',
    'assets/images/map/grass7.png',
    'assets/images/map/restaurant.png',
  ];
  let images = [];
  imgPreload(imgs, ims => {
    images = ims;
    pos.y = height * 0.;
    drawBoard(ctx, screen, pixelsToHex(pos, width, height), images);
  });


  const offset = {
    x: canvas.offsetLeft,
    y: canvas.offsetTop,
    clickX: 0,
    clickY: 0
  };
  canvas.addEventListener('mousedown', e => {
    offset.clickX = e.offsetX + offset.x;
    offset.clickY = e.offsetY + offset.y;
    console.log(pos);
    canvas.addEventListener('mousemove', dragMap)
  });
  canvas.addEventListener('mouseup', e => {
    pos.x += e.clientX - offset.clickX,
    pos.y += e.clientY - offset.clickY
    canvas.removeEventListener('mousemove', dragMap);
  });

  function drawBoard(canvasContext, screen, topSide, images) {
    console.log(topSide);
    // topSide.xOffset = 0;
    // console.log(topSide);
    let fillY, fillX = fillY = true;
    canvasContext.clearRect(0, 0, screen[0], screen[1])
    for (let i = 0; fillY; ++i) {
      const y = i * aHeight + topSide.yOffset;
      fillY = y + aHeight < screen[1];
      fillX = true;
      for (let j = 0; fillX; ++j) {
        const offset = (i + topSide.y) % 2 * radius;
        const pos = j * width - offset + topSide.xOffset;
        const x = pos;
        fillX = x + width < screen[0];
        // console.log(y, x)
        drawHexagon(ctx, x, y, images[Math.round(rng(`${i + topSide.y},${j + topSide.x}`) * (images.length - 1))], j + topSide.x, i + topSide.y);
      }
    }
  }

  function rng(string) {
    return new Math.seedrandom(string).quick();
  }

  function drawHexagon(canvasContext, x, y, img, hx, hy) {
    canvasContext.save();
    canvasContext.beginPath();
    canvasContext.moveTo(x + radius, y);
    canvasContext.lineTo(x + width, y + hexHeight);
    canvasContext.lineTo(x + width, y + hexHeight + side);
    canvasContext.lineTo(x + radius, y + height);
    canvasContext.lineTo(x, y + side + hexHeight);
    canvasContext.lineTo(x, y + hexHeight);
    canvasContext.closePath();
    canvasContext.clip();
    canvasContext.drawImage(img, x, y, width, height);
    canvasContext.restore();
    canvasContext.stroke();
    canvasContext.fillText(`${hx},${hy}`, x + width / 2 - 15, y + height / 2 + 5);
  }

  function pixelsToHex(pos, width, height) {
    let yHex = pos.y / (height * 0.75);
    // console.log(yHex, yHex % 1);
    yHex = yHex % 1 <= 0.25 ? yHex - 0.25 : yHex;
    console.log(yHex);
    // yHex = yHex % 1 <= 0.25 ? yHex - 0.25 : yHex;
    // const adjustedX = pos.x - Math.floor(yHex + 1) % 2 * width / 2 ;
    // const adjustedX = 0;
    // adjustedX = 0
    // console.log(Math.floor(yHex) % 2)
    const xHex = pos.x / width;
    const x = Math.floor(xHex);
    const y = Math.floor(yHex);
    console.log(yHex % 1, yHex, y)
    let yOffset = - (yHex % 1) * height;
    if (yHex < 0) {
      yOffset -= 1 * height;
    }
    return {
      y,
      x,
      yOffset,
      // xOffset: - (xHex - Math.floor(xHex)) * width,
      xOffset: - (xHex % 1) * width,
    }
  }

  // function pixelsToHex(pos, width, height) {
  //   let yHex = pos.y / (height * 0.75);
  //   yHex = yHex % 1 <= 0.25 ? yHex - 0.25 : yHex;
  //   // const adjustedX = pos.x - Math.floor(yHex + 1) % 2 * width / 2 ;
  //   // const adjustedX = 0;
  //   // adjustedX = 0
  //   // console.log(Math.floor(yHex) % 2)
  //   const xHex = pos.x / width;
  //   const x = Math.floor(xHex);
  //   const y = Math.floor(yHex);
  //   let yOffset = - yHex % 1 * height;
  //   if (yHex < 0) {
  //     yOffset -= 1 * height;
  //   }
  //   return {
  //     y,
  //     x,
  //     yOffset,
  //     // xOffset: - (xHex - Math.floor(xHex)) * width,
  //     xOffset: - (xHex - x) * width,
  //   }
  // }

  function dragMap(e) {
    e.preventDefault();
    const l = {
      x: pos.x + e.clientX - offset.clickX,
      y: pos.y + e.clientY - offset.clickY
    };
    drawBoard(ctx, screen, pixelsToHex(l, width, height), images)
    // console.log('move', x, y, offset.clickY);
  }
}


function imgPreload(imgs, cb) {
  const images = [];
  let loaded = 0;
  imgs = Object.prototype.toString.apply(imgs) === '[object Array]' ? imgs : [imgs];
  const inc = function() {
    loaded += 1;
    if (loaded === imgs.length && cb) {
      cb(images);
    }
  };
  for (let i = 0; i < imgs.length; i++) {
    images[i] = new Image();
    images[i].onabort = inc;
    images[i].onerror = inc;
    images[i].onload = inc;
    images[i].src = imgs[i];
  }
}
