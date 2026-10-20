
const fragCanvas=document.createElement("canvas");
const fctx=fragCanvas.getContext("2d");

// Mảnh càng nhỏ thì hiệu ứng càng chi tiết
const tile=6;
let fragments=[];

function buildFragments(){
 fragments=[];

 const w=overlay.width;
 const h=overlay.height;

 fragCanvas.width=w;
 fragCanvas.height=h;

 for(let y=0;y<h;y+=tile){
  for(let x=0;x<w;x+=tile){
   const dx=x+tile/2-w/2;
   const dy=y+tile/2-h/2;
   const dist=Math.hypot(dx,dy)||1;

   const n=Math.sin(x*12.9898+y*78.233)*43758.5453;
   const rnd=n-Math.floor(n);

   fragments.push({
    x,y,
    w:Math.min(tile,w-x),
    h:Math.min(tile,h-y),
    dx:dx/dist,
    dy:dy/dist,
    seed:rnd,
    spin:(rnd-.5)*5,
    drift:(rnd-.5)*1.5,
    side:Math.sin(rnd*60),
    depth:.5+rnd*1.8
   });
  }
 }
}

function ease(v){
 v=Math.max(0,Math.min(1,v));
 return v*v*(3-2*v);
}

function renderFragments(t){
 const w=overlay.width;
 const h=overlay.height;

 // Chụp la kinh trước khi phân mảnh
 fctx.clearRect(0,0,w,h);
 fctx.drawImage(overlay,0,0);

 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,w,h);

 // Chu kỳ vỡ và tái tạo
 const cycle=(t%7.5)/7.5;

 const burst=ease(cycle/.20);
 const reform=ease((cycle-.66)/.34);
 const amount=burst*(1-reform);

 const spread=Math.min(w,h)*.48*amount;

 for(const p of fragments){
  const wave=Math.sin(t*2.8+p.seed*24);
  const wave2=Math.cos(t*2.1+p.seed*19);

  // Mảnh bay theo hướng xuyên tâm và lệch ngẫu nhiên
  const distance=spread*(.55+p.depth*.45);

  const ox=
   p.dx*distance+
   p.drift*spread*.28+
   wave*spread*.10*p.side;

  const oy=
   p.dy*distance+
   wave2*spread*.09;

  const cx=p.x+p.w/2+ox;
  const cy=p.y+p.h/2+oy;

  // Xoay mạnh khi mảnh bay ra
  const rot=p.spin*amount+
   Math.sin(t*1.7+p.seed*15)*amount*.8;

  // Mảnh nhỏ dần rồi trở lại kích thước ban đầu
  const scale=1-.30*amount*(.4+p.seed*.6);

  ctx.save();
  ctx.globalAlpha=1-.30*amount;
  ctx.translate(cx,cy);
  ctx.rotate(rot);
  ctx.scale(scale,scale);

  ctx.drawImage(
   fragCanvas,
   p.x,p.y,p.w,p.h,
   -p.w/2,-p.h/2,p.w,p.h
  );

  // Viền sáng trên các mảnh đang bung
  if(amount>.04){
   ctx.strokeStyle=
    "rgba(220,230,255,"+
    (amount*(.25+.45*p.seed))+")";
   ctx.lineWidth=.65;
   ctx.strokeRect(-p.w/2,-p.h/2,p.w,p.h);
  }

  ctx.restore();
 }
}
