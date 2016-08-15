let pos = [0, 0];
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

setTimeout(initMap, 0, ctx, screen);

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
    drawBoard(ctx, screen, pixelsToHex(0, height*1.8, width, height), images);
  });


  const offset = {
    x: canvas.offsetLeft,
    y: canvas.offsetTop,
    clickX: 0,
    clickY: 0
  };

  canvas.addEventListener('mousedown', e => {
    offset.clickX = e.offsetX;
    offset.clickY = e.offsetY;
    console.log(offset, canvas.offsetTop)
    canvas.addEventListener('mousemove', dragMap)
  });
  canvas.addEventListener('mouseup', () => {
    console.log('click down');
    canvas.removeEventListener('mousemove', dragMap);
  });

  function drawBoard(canvasContext, screen, topSide, images) {
    // console.log(topSide);
    let fillY, fillX = fillY = true;
    canvasContext.clearRect(0, 0, screen[0], screen[1])
    for (let i = 0; fillY; ++i) {
      const y = i * aHeight + topSide.yOffset;
      fillY = y + aHeight < screen[1];
      fillX = true;
      for (let j = 0; fillX; ++j) {
        const offset = (i % 2) * radius;
        const pos = j * width - offset + topSide.xOffset;
        // const x = j === 0 && pos < width ? 0 : pos;
        const x = /*j === 0 && pos < width ? 0 :*/ pos;
        fillX = x + width < screen[0];
        drawHexagon(ctx, x, y, images[ (i + j) % images.length], j + topSide.x, i + topSide.y);
      }
    }
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

  function pixelsToHex(x, y, width, height) {
    let yHex = y / (height * 0.75);
    yHex = yHex % 1 <= 0.25 ? yHex - 0.25 : yHex;
    console.log(yHex, (yHex - Math.floor(yHex)), yHex % 1)
    const adjustedX = x - Math.floor(yHex) % 2 * width / 2;
    const xHex = adjustedX / width;
    // const yHux = y / (height * 0.75);
    // console.log(Math.floor(xHex), xHex, yHex  )
    // const t = y / height * 1.25;
    return {
      x: Math.floor(xHex),
      y: Math.floor(yHex),
      xOffset: - (xHex - Math.floor(xHex)) * width,
      // yOffset: - (yHex - Math.floor(yHex)) * height * 0.75
      yOffset: - (yHex % 1) * height
    }
  }

  function dragMap(ev) {
    ev.preventDefault();
    const x = ev.clientX - offset.x - offset.clickX;
    const y = ev.clientY - offset.y - offset.clickY;
    drawBoard(ctx, screen, pixelsToHex(x, y, width, height), images)
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
