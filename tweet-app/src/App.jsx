import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════ */
const TONES = ["Witty","Bold","Premium","Humorous","Informative","Playful","Minimal","Inspirational"];
const OBJECTIVES = ["Engagement","Promotion","Awareness","Education","Community","Product Launch"];
const INDUSTRIES = ["Technology","Fashion & Beauty","Food & Beverage","Finance","Health & Wellness","Entertainment","E-commerce","Travel","Sports","Education"];

// Exactly matches assignment: engaging/conversational, promotional, witty/meme-style, informative/value-driven (x2.5)
const TWEET_STYLES = [
  "engaging / conversational",
  "promotional",
  "witty / meme-style",
  "informative / value-driven",
  "engaging / conversational",
  "promotional",
  "witty / meme-style",
  "informative / value-driven",
  "engaging / conversational",
  "promotional",
];
const PALETTE = ["#3b82f6","#8b5cf6","#06b6d4","#a855f7","#6366f1","#7c3aed","#2563eb","#9333ea","#0ea5e9","#7e22ce"];

/* ══════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#030712;font-family:'DM Sans',sans-serif;color:#fff;overflow-x:hidden}
::selection{background:#3b82f655;color:#fff}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:linear-gradient(#3b82f6,#8b5cf6);border-radius:2px}
input,textarea{font-family:'DM Sans',sans-serif;color:#e0eaff}
input::placeholder,textarea::placeholder{color:rgba(150,180,255,0.25)}
input:focus,textarea:focus{outline:none}
textarea{resize:none}
button{outline:none;font-family:'DM Sans',sans-serif;cursor:pointer}

@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spinRing{to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
@keyframes gradFlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes tweetIn{from{opacity:0;transform:translateX(-18px) scale(.97)}to{opacity:1;transform:translateX(0) scale(1)}}
@keyframes scanLine{from{width:0}to{width:100%}}
@keyframes ripple{0%{transform:scale(0);opacity:.5}100%{transform:scale(4);opacity:0}}
@keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
`;

/* ══════════════════════════════════════════════════════
   CANVAS LOGO PAINTERS — each draws a clean, recognisable
   social logo onto a 256×256 canvas for use as a texture.
══════════════════════════════════════════════════════ */
const LOGO_DEFS = [
  {
    key: "twitter", bg: "#000000", fg: "#ffffff",
    draw(ctx, S) {
      // Official X logo path (two diagonal bars)
      const s = S * 0.52;
      ctx.fillStyle = this.fg;
      ctx.beginPath();
      // bar 1: top-left → bottom-right
      const t = s * 0.19;
      ctx.moveTo(S/2 - s, S/2 - s);
      ctx.lineTo(S/2 - s + t*1.6, S/2 - s);
      ctx.lineTo(S/2, S/2 - t*0.45);
      ctx.lineTo(S/2 + s - t*1.6, S/2 - s);
      ctx.lineTo(S/2 + s, S/2 - s);
      ctx.lineTo(S/2 + t*0.55, S/2);
      ctx.lineTo(S/2 + s, S/2 + s);
      ctx.lineTo(S/2 + s - t*1.6, S/2 + s);
      ctx.lineTo(S/2, S/2 + t*0.45);
      ctx.lineTo(S/2 - s + t*1.6, S/2 + s);
      ctx.lineTo(S/2 - s, S/2 + s);
      ctx.lineTo(S/2 - t*0.55, S/2);
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    key: "instagram", bg: null, fg: "#ffffff",
    bgGrad: ["#f09433","#e6683c","#dc2743","#cc2366","#bc1888"],
    draw(ctx, S) {
      const r = S * 0.22, cx = S/2, cy = S/2, lw = S*0.075;
      ctx.strokeStyle = this.fg; ctx.lineWidth = lw;
      // outer rounded square
      const p = S*0.18, rad = S*0.22;
      ctx.beginPath();
      ctx.moveTo(p+rad, p); ctx.lineTo(S-p-rad, p);
      ctx.arcTo(S-p,p, S-p,p+rad, rad);
      ctx.lineTo(S-p, S-p-rad); ctx.arcTo(S-p,S-p, S-p-rad,S-p, rad);
      ctx.lineTo(p+rad, S-p); ctx.arcTo(p,S-p, p,S-p-rad, rad);
      ctx.lineTo(p, p+rad); ctx.arcTo(p,p, p+rad,p, rad);
      ctx.closePath(); ctx.stroke();
      // inner circle
      ctx.beginPath(); ctx.arc(cx, cy, S*0.22, 0, Math.PI*2); ctx.stroke();
      // dot
      ctx.fillStyle = this.fg;
      ctx.beginPath(); ctx.arc(S*0.72, S*0.28, lw*0.7, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    key: "linkedin", bg: "#0a66c2", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      const lw = S*0.13, dot = S*0.095;
      // dot
      ctx.beginPath(); ctx.arc(S*0.28, S*0.3, dot, 0, Math.PI*2); ctx.fill();
      // vertical bar 1
      ctx.fillRect(S*0.195, S*0.42, lw, S*0.38);
      // vertical bar 2
      ctx.fillRect(S*0.52, S*0.42, lw, S*0.38);
      // arch of bar 2
      ctx.beginPath();
      ctx.arc(S*0.585, S*0.485, S*0.135, Math.PI, 0);
      ctx.rect(S*0.52, S*0.485, lw*2.05, S*0.335);
      ctx.fill();
    }
  },
  {
    key: "youtube", bg: "#ff0000", fg: "#ffffff",
    draw(ctx, S) {
      // play triangle
      ctx.fillStyle = this.fg;
      const cx=S/2, cy=S/2, ps=S*0.28;
      ctx.beginPath();
      ctx.moveTo(cx - ps*0.6, cy - ps);
      ctx.lineTo(cx + ps,     cy);
      ctx.lineTo(cx - ps*0.6, cy + ps);
      ctx.closePath(); ctx.fill();
    }
  },
  {
    key: "facebook", bg: "#1877f2", fg: "#ffffff",
    draw(ctx, S) {
      // lowercase "f"
      ctx.fillStyle = this.fg;
      const lw=S*0.13, x=S*0.52, top=S*0.16;
      ctx.fillRect(x-lw/2, top, lw, S*0.68); // vertical bar
      // top arc
      ctx.beginPath();
      ctx.arc(x+S*0.06, top+S*0.14, S*0.14, Math.PI, 0);
      ctx.fill();
      // crossbar
      ctx.fillRect(x-S*0.15, S*0.44, S*0.28, lw*0.8);
    }
  },
  {
    key: "tiktok", bg: "#010101", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = "#69c9d0"; // cyan shadow
      const nx=S*0.46, ny=S*0.16, nw=S*0.14, nh=S*0.44, nr=nw/2;
      // note head + stem (cyan)
      ctx.beginPath(); ctx.ellipse(nx+S*0.13,ny+nh,nr*1.15,nr*0.9,0,0,Math.PI*2); ctx.fill();
      ctx.fillRect(nx+S*0.13-nr*0.9, ny, nr*1.8, nh);
      // curve top
      ctx.beginPath(); ctx.arc(nx+S*0.2, ny+S*0.14, S*0.14, Math.PI*1.5, 0); ctx.fill();
      ctx.fillRect(nx+S*0.33, ny, nw*0.9, S*0.22);

      ctx.fillStyle = "#fe2c55"; // red shadow offset
      ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.ellipse(nx+S*0.09,ny+nh,nr*1.15,nr*0.9,0,0,Math.PI*2); ctx.fill();
      ctx.fillRect(nx+S*0.09-nr*0.9, ny, nr*1.8, nh);
      ctx.globalAlpha=1;

      ctx.fillStyle = this.fg;
      ctx.beginPath(); ctx.ellipse(nx+S*0.11,ny+nh,nr*1.15,nr*0.9,0,0,Math.PI*2); ctx.fill();
      ctx.fillRect(nx+S*0.11-nr*0.9, ny, nr*1.8, nh);
      ctx.beginPath(); ctx.arc(nx+S*0.18, ny+S*0.14, S*0.14, Math.PI*1.5, 0); ctx.fill();
      ctx.fillRect(nx+S*0.31, ny, nw*0.9, S*0.22);
    }
  },
  {
    key: "snapchat", bg: "#fffc00", fg: "#000000",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      // Ghost body
      const cx=S/2, r=S*0.3, bot=S*0.78;
      ctx.beginPath();
      ctx.arc(cx, S*0.38, r, Math.PI, 0);
      // right side down
      ctx.lineTo(cx+r, bot-S*0.08);
      // right foot notch
      ctx.lineTo(cx+r*0.55, bot-S*0.16);
      ctx.lineTo(cx+r*0.22, bot);
      // bottom curve
      ctx.arc(cx, bot-S*0.05, r*0.22, 0, Math.PI);
      // left foot
      ctx.lineTo(cx-r*0.55, bot-S*0.16);
      ctx.lineTo(cx-r, bot-S*0.08);
      ctx.closePath(); ctx.fill();
    }
  },
  {
    key: "pinterest", bg: "#e60023", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      // Big P
      const x=S*0.28, y=S*0.18, lw=S*0.13, bh=S*0.28;
      ctx.fillRect(x, y, lw, S*0.64); // stem
      ctx.beginPath(); ctx.arc(x+lw/2+S*0.1, y+S*0.16, S*0.2, 0, Math.PI*2); ctx.fill();
      // pin tail going down
      ctx.fillStyle = this.fg;
      ctx.beginPath();
      ctx.moveTo(S*0.42, S*0.55);
      ctx.lineTo(S*0.52, S*0.82);
      ctx.lineWidth = lw*0.7; ctx.strokeStyle = this.fg; ctx.stroke();
    }
  },
  {
    key: "reddit", bg: "#ff4500", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      const cx=S/2, cy=S*0.52;
      // alien head circle
      ctx.beginPath(); ctx.arc(cx, cy, S*0.28, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ff4500";
      // left eye
      ctx.beginPath(); ctx.arc(cx-S*0.1, cy-S*0.04, S*0.055, 0, Math.PI*2); ctx.fill();
      // right eye
      ctx.beginPath(); ctx.arc(cx+S*0.1, cy-S*0.04, S*0.055, 0, Math.PI*2); ctx.fill();
      // smile
      ctx.strokeStyle = "#ff4500"; ctx.lineWidth = S*0.04;
      ctx.beginPath(); ctx.arc(cx, cy+S*0.04, S*0.1, 0.2, Math.PI-0.2); ctx.stroke();
      // white antennas / ears on top
      ctx.fillStyle = this.fg;
      ctx.beginPath(); ctx.arc(cx-S*0.22, cy-S*0.22, S*0.07, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+S*0.22, cy-S*0.22, S*0.07, 0, Math.PI*2); ctx.fill();
      // body
      ctx.beginPath(); ctx.ellipse(cx, cy+S*0.38, S*0.18, S*0.1, 0, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    key: "discord", bg: "#5865f2", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      // Controller / headset silhouette
      const cx=S/2, cy=S*0.45, rw=S*0.36, rh=S*0.26;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI*2);
      ctx.fill();
      // bottom notch
      ctx.fillStyle = "#5865f2";
      ctx.beginPath(); ctx.arc(cx, cy+rh, S*0.12, 0, Math.PI); ctx.fill();
      // left eye
      ctx.fillStyle = this.fg;
      ctx.beginPath(); ctx.ellipse(cx-S*0.12, cy-S*0.02, S*0.075, S*0.09, 0, 0, Math.PI*2); ctx.fill();
      // right eye
      ctx.beginPath(); ctx.ellipse(cx+S*0.12, cy-S*0.02, S*0.075, S*0.09, 0, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    key: "telegram", bg: "#26a5e4", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      // Paper-plane arrow
      const cx=S/2, cy=S/2;
      ctx.beginPath();
      ctx.moveTo(S*0.14, cy);
      ctx.lineTo(S*0.86, S*0.3);
      ctx.lineTo(S*0.6,  S*0.76);
      ctx.lineTo(S*0.48, S*0.58);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(S*0.48, S*0.58);
      ctx.lineTo(S*0.86, S*0.3);
      ctx.lineTo(S*0.66, S*0.88);
      ctx.closePath(); ctx.fill();
    }
  },
  {
    key: "whatsapp", bg: "#25d366", fg: "#ffffff",
    draw(ctx, S) {
      ctx.fillStyle = this.fg;
      const cx=S/2, cy=S*0.46, r=S*0.3;
      // speech bubble
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      // tail
      ctx.beginPath();
      ctx.moveTo(cx-S*0.08, cy+r-S*0.02);
      ctx.lineTo(cx-S*0.28, cy+r+S*0.12);
      ctx.lineTo(cx+S*0.04, cy+r-S*0.06);
      ctx.closePath(); ctx.fill();
      // phone handset icon inside
      ctx.fillStyle = "#25d366";
      ctx.beginPath();
      ctx.arc(cx-S*0.08, cy-S*0.04, S*0.065, Math.PI*0.6, Math.PI*1.8); ctx.fill();
      ctx.beginPath();
      ctx.arc(cx+S*0.08, cy+S*0.06, S*0.065, Math.PI*1.6, Math.PI*0.8); ctx.fill();
      ctx.strokeStyle="#25d366"; ctx.lineWidth=S*0.075;
      ctx.beginPath();
      ctx.moveTo(cx-S*0.04, cy-S*0.12);
      ctx.bezierCurveTo(cx+S*0.08,cy-S*0.12, cx+S*0.08,cy+S*0.12, cx+S*0.04,cy+S*0.12);
      ctx.stroke();
    }
  },
];

/* ══════════════════════════════════════════════════════
   BUILD ONE 256×256 CANVAS TEXTURE PER LOGO
══════════════════════════════════════════════════════ */
function buildLogoTexture(def) {
  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d");

  // rounded-rect clip
  const pad = S*0.04, rad = S*0.22;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pad+rad, pad);
  ctx.lineTo(S-pad-rad, pad); ctx.arcTo(S-pad,pad, S-pad,pad+rad, rad);
  ctx.lineTo(S-pad, S-pad-rad); ctx.arcTo(S-pad,S-pad, S-pad-rad,S-pad, rad);
  ctx.lineTo(pad+rad, S-pad); ctx.arcTo(pad,S-pad, pad,S-pad-rad, rad);
  ctx.lineTo(pad, pad+rad); ctx.arcTo(pad,pad, pad+rad,pad, rad);
  ctx.closePath(); ctx.clip();

  // background
  if (def.bgGrad) {
    const grad = ctx.createLinearGradient(0,S,S,0);
    def.bgGrad.forEach((c,i) => grad.addColorStop(i/(def.bgGrad.length-1), c));
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = def.bg || "#111";
  }
  ctx.fillRect(0, 0, S, S);

  // draw logo
  def.draw(ctx, S);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/* ══════════════════════════════════════════════════════
   THREE.JS SCENE — FLOATING SOCIAL MEDIA LOGO SPRITES
══════════════════════════════════════════════════════ */
function SocialMediaSpaceScene() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 300);
    camera.position.set(0, 0, 34);

    /* — LIGHTS — */
    scene.add(new THREE.AmbientLight(0x1e3a8a, 1.2));
    [
      [0x3b82f6, 5, 90, [16, 12, 12]],
      [0x8b5cf6, 4, 80, [-16, -10, 8]],
      [0x06b6d4, 3, 70, [0, 20, -10]],
      [0xa855f7, 2.5, 60, [-10, -18, 6]],
    ].forEach(([c, i, d, p]) => {
      const l = new THREE.PointLight(c, i, d);
      l.position.set(...p);
      scene.add(l);
    });

    /* — STAR FIELD — */
    const sCnt = 700, sPos = new Float32Array(sCnt * 3), sCol = new Float32Array(sCnt * 3);
    const sPal = [new THREE.Color(0x93c5fd), new THREE.Color(0xc4b5fd), new THREE.Color(0xe0f2fe), new THREE.Color(0xddd6fe)];
    for (let i = 0; i < sCnt; i++) {
      sPos[i*3] = (Math.random()-.5)*220; sPos[i*3+1] = (Math.random()-.5)*160; sPos[i*3+2] = (Math.random()-.5)*110 - 20;
      const c = sPal[i % sPal.length]; sCol[i*3]=c.r; sCol[i*3+1]=c.g; sCol[i*3+2]=c.b;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ size: 0.11, vertexColors: true, transparent: true, opacity: 0.7 })));

    /* — NEBULA CLOUDS — */
    [[0x3b82f6,-22,12],[0x8b5cf6,22,-14],[0xa855f7,-16,-16],[0x06b6d4,20,16]].forEach(([c,cx,cy]) => {
      const cnt = 140, p = new Float32Array(cnt*3);
      for (let i=0;i<cnt;i++){p[i*3]=cx+(Math.random()-.5)*20;p[i*3+1]=cy+(Math.random()-.5)*16;p[i*3+2]=(Math.random()-.5)*14-18;}
      const g = new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(p,3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:c,size:0.28,transparent:true,opacity:0.14})));
    });

    /* — BUILD LOGO TEXTURES ONCE — */
    const textures = LOGO_DEFS.map(def => buildLogoTexture(def));

    /* — SPAWN LOGO SPRITES — */
    const logos = [];
    const totalLogos = 36;

    for (let i = 0; i < totalLogos; i++) {
      const tex = textures[i % textures.length];
      const size = 0.9 + Math.random() * 1.2; // visible sprite size in world units

      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.72 + Math.random() * 0.25,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(size, size, 1);

      sprite.position.set(
        (Math.random() - 0.5) * 64,
        (Math.random() - 0.5) * 46,
        (Math.random() - 0.5) * 20 - 4
      );
      sprite.userData = {
        fy:  0.0003 + Math.random() * 0.0007,
        fo:  Math.random() * Math.PI * 2,
        oy:  sprite.position.y,
        fx:  0.00012 + Math.random() * 0.00025,
        fox: Math.random() * Math.PI * 2,
        ox:  sprite.position.x,
        // gentle rotation via material rotation
        rz:  (Math.random() - 0.5) * 0.006,
        rot: Math.random() * Math.PI * 2,
      };
      scene.add(sprite);
      logos.push(sprite);
    }

    /* — TWEET BUBBLES — */
    function makeBubble(w, h) {
      const s = new THREE.Shape(), r = 0.28;
      s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2); s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      s.lineTo(w/2,h/2-r);   s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
      s.lineTo(-w/2+r,h/2);  s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
      s.lineTo(-w/2,-h/2+r); s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      return new THREE.ExtrudeGeometry(s, { depth:0.1, bevelEnabled:true, bevelThickness:0.025, bevelSize:0.025, bevelSegments:2 });
    }
    const bubbleSizes = [[3.4,1.2],[4.2,1.4],[2.8,1.0],[5.0,1.5],[3.0,1.1]];
    const bubbles = [];
    for (let i = 0; i < 12; i++) {
      const [bw, bh] = bubbleSizes[i % bubbleSizes.length];
      const geo = makeBubble(bw, bh); geo.center();
      const mat = new THREE.MeshPhongMaterial({
        color: [0x1d4ed8,0x5b21b6,0x0369a1,0x6d28d9][i%4],
        transparent: true, opacity: 0.09 + Math.random()*0.13,
        shininess: 50, emissiveIntensity: 0.05
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random()-.5)*60,(Math.random()-.5)*42,(Math.random()-.5)*14-10);
      mesh.rotation.z = (Math.random()-.5)*0.4;
      mesh.userData = { rx:(Math.random()-.5)*0.002, ry:(Math.random()-.5)*0.003, fy:0.0003+Math.random()*0.0005, fo:Math.random()*Math.PI*2, oy:mesh.position.y };
      scene.add(mesh); bubbles.push(mesh);
    }

    /* — ORBITAL RINGS — */
    const rings = [];
    [[9,0.07,0x3b82f6,0.35],[14,0.055,0x8b5cf6,0.28],[20,0.045,0x06b6d4,0.22]].forEach(([r,t,c,o]) => {
      const geo = new THREE.TorusGeometry(r, t, 8, 90);
      const mat = new THREE.MeshBasicMaterial({ color:c, transparent:true, opacity:o });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.random()*Math.PI; ring.rotation.y = Math.random()*Math.PI;
      ring.userData = { rx: 0.0008+Math.random()*0.0015, ry: 0.0006+Math.random()*0.001 };
      scene.add(ring); rings.push(ring);
    });

    /* — MOUSE PARALLAX — */
    let mx=0, my=0, cx2=0, cy2=0;
    const onMouse = e => { mx=(e.clientX/window.innerWidth-.5)*2; my=(e.clientY/window.innerHeight-.5)*2; };
    window.addEventListener("mousemove", onMouse);
    const onResize = () => {
      W=window.innerWidth; H=window.innerHeight;
      camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H);
    };
    window.addEventListener("resize", onResize);

    /* — ANIMATION LOOP — */
    let raf;
    const tick = (t=0) => {
      raf = requestAnimationFrame(tick);
      cx2 += (mx*3 - cx2)*0.022; cy2 += (-my*2 - cy2)*0.022;
      camera.position.x = cx2; camera.position.y = cy2;
      camera.lookAt(scene.position);

      logos.forEach(m => {
        m.userData.rot += m.userData.rz;
        m.material.rotation = m.userData.rot;
        m.position.y = m.userData.oy + Math.sin(t*m.userData.fy + m.userData.fo)*2.0;
        m.position.x = m.userData.ox + Math.sin(t*m.userData.fx + m.userData.fox)*1.0;
      });
      bubbles.forEach(m => {
        m.rotation.x += m.userData.rx; m.rotation.y += m.userData.ry;
        m.position.y = m.userData.oy + Math.sin(t*m.userData.fy + m.userData.fo)*1.6;
      });
      rings.forEach(r => { r.rotation.x += r.userData.rx; r.rotation.y += r.userData.ry; });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      textures.forEach(t => t.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

/* ══════════════════════════════════════════════════════
   TILT CARD
══════════════════════════════════════════════════════ */
function TiltCard({ children, glow="#3b82f6", style={} }) {
  const ref = useRef(null);
  const [rot, setRot] = useState({x:0,y:0});
  const [on, setOn] = useState(false);
  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setRot({ x:((e.clientY-r.top)/r.height-.5)*-14, y:((e.clientX-r.left)/r.width-.5)*14 });
  };
  return (
    <div ref={ref}
      onMouseMove={onMove}
      onMouseEnter={()=>setOn(true)}
      onMouseLeave={()=>{setRot({x:0,y:0});setOn(false);}}
      style={{
        transform:`perspective(1000px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) translateZ(${on?10:0}px)`,
        transition: on?"transform 0.08s ease,box-shadow 0.3s":"transform 0.55s cubic-bezier(0.23,1,0.32,1),box-shadow 0.3s",
        transformStyle:"preserve-3d",
        background:"linear-gradient(135deg,rgba(25,40,90,0.82),rgba(12,18,48,0.78))",
        backdropFilter:"blur(32px) saturate(160%)", WebkitBackdropFilter:"blur(32px) saturate(160%)",
        border:`1px solid rgba(99,140,255,${on?.2:.09})`,
        borderRadius:"24px",
        boxShadow:on
          ? `0 32px 72px rgba(0,0,20,0.75),0 0 60px ${glow}2a,inset 0 1px 0 rgba(150,180,255,0.16)`
          : `0 8px 36px rgba(0,0,20,0.5),inset 0 1px 0 rgba(150,180,255,0.07)`,
        position:"relative", overflow:"hidden", ...style
      }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:`radial-gradient(ellipse at 40% 0%,${glow}16,transparent 70%)`,pointerEvents:"none",zIndex:0,opacity:on?1:0.5,transition:"opacity 0.3s"}}/>
      <div style={{position:"absolute",top:"-100%",left:"-55%",width:"50%",height:"300%",background:"linear-gradient(105deg,transparent 38%,rgba(150,200,255,0.045) 50%,transparent 62%)",transform:on?"translateX(400%)":"translateX(0)",transition:on?"transform 0.65s ease":"none",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NEON BUTTON
══════════════════════════════════════════════════════ */
function NeonBtn({ children, onClick, disabled, color1="#1d4ed8", color2="#7c3aed", glow="#3b82f655", full, style={} }) {
  const [pressed,setPressed]=useState(false);
  const [hovered,setHovered]=useState(false);
  const [ripples,setRipples]=useState([]);
  const fire = e => {
    if(disabled) return;
    const r=e.currentTarget.getBoundingClientRect();
    const id=Date.now();
    setRipples(p=>[...p,{id,x:e.clientX-r.left,y:e.clientY-r.top}]);
    setTimeout(()=>setRipples(p=>p.filter(x=>x.id!==id)),700);
    onClick&&onClick(e);
  };
  return (
    <button disabled={disabled}
      onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>{setHovered(false);setPressed(false);}}
      onClick={fire}
      style={{
        width:full?"100%":"auto", padding:"17px 28px",
        background:`linear-gradient(135deg,${color1},${color2})`,
        border:"none", borderRadius:"14px",
        cursor:disabled?"not-allowed":"pointer",
        color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700,
        fontSize:"13px", letterSpacing:"1.5px",
        boxShadow:`0 ${hovered?"18":"8"}px ${hovered?"48":"28"}px ${glow},inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.25)`,
        transform:pressed?"scale(0.97) translateY(1px)":hovered?"translateY(-2px) scale(1.01)":"none",
        transition:"transform 0.15s ease,box-shadow 0.2s ease,opacity 0.2s",
        opacity:disabled?.5:1,
        position:"relative", overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", ...style
      }}>
      {ripples.map(r=>(
        <span key={r.id} style={{position:"absolute",left:r.x,top:r.y,width:"20px",height:"20px",marginLeft:"-10px",marginTop:"-10px",borderRadius:"50%",background:"rgba(255,255,255,0.28)",animation:"ripple 0.7s ease-out forwards",pointerEvents:"none"}}/>
      ))}
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   GHOST BUTTON
══════════════════════════════════════════════════════ */
function GhostBtn({ children, onClick }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      padding:"17px 24px",
      background:h?"rgba(59,130,246,0.1)":"rgba(59,130,246,0.04)",
      border:`1.5px solid rgba(99,140,255,${h?.3:.14})`,
      borderRadius:"14px", color:`rgba(180,210,255,${h?.85:.45})`,
      fontFamily:"'Syne',sans-serif", fontSize:"13px", fontWeight:600, letterSpacing:"0.5px",
      transition:"all 0.2s", transform:h?"translateY(-1px)":"none"
    }}>{children}</button>
  );
}

/* ══════════════════════════════════════════════════════
   CHIP
══════════════════════════════════════════════════════ */
function Chip({ label, selected, onClick, color="#3b82f6" }) {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      padding:"7px 16px", borderRadius:"999px", border:"none",
      background:selected?`linear-gradient(135deg,${color}dd,${color}88)`:h?"rgba(59,130,246,0.12)":"rgba(59,130,246,0.06)",
      color:selected?"#fff":h?"rgba(180,210,255,0.8)":"rgba(150,180,255,0.45)",
      fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", fontWeight:selected?600:400,
      transform:selected?"scale(1.06) translateY(-1px)":h?"scale(1.02)":"scale(1)",
      transition:"all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow:selected?`0 4px 18px ${color}44,inset 0 1px 0 rgba(255,255,255,0.2)`:"none"
    }}>
      {selected&&<span style={{marginRight:"5px",fontSize:"9px"}}>✦</span>}{label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   FLOAT INPUT
══════════════════════════════════════════════════════ */
function FloatInput({ label, value, onChange, placeholder, multiline, color="#3b82f6" }) {
  const [focus,setFocus]=useState(false);
  const raised = focus || value.length > 0;
  const base = {
    width:"100%", background:"rgba(15,25,65,0.55)",
    border:`1.5px solid ${focus?color:"rgba(99,140,255,0.13)"}`,
    borderRadius:"13px", padding:"22px 16px 10px",
    color:"#dde9ff", fontSize:"14px", lineHeight:1.6,
    transition:"border-color 0.2s,box-shadow 0.2s",
    boxShadow:focus?`0 0 0 3px ${color}1a`:"none",
  };
  return (
    <div style={{position:"relative",marginBottom:"20px"}}>
      <label style={{
        position:"absolute", left:"16px",
        top:raised?"8px":"50%", transform:raised?"none":"translateY(-50%)",
        fontSize:raised?"9.5px":"13.5px", fontWeight:raised?600:400,
        letterSpacing:raised?"1.8px":"0", textTransform:raised?"uppercase":"none",
        color:raised?color:"rgba(150,180,255,0.38)",
        pointerEvents:"none", zIndex:3,
        transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
        fontFamily:"'DM Sans',sans-serif"
      }}>{label}</label>
      {multiline
        ? <textarea rows={3} style={{...base,paddingTop:"24px"}} value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} placeholder={focus?placeholder:""}/>
        : <input style={base} value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} placeholder={focus?placeholder:""}/>
      }
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════════════════ */
function Steps({ current }) {
  const labels = ["Brand Info","Brand Voice","Results"];
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"36px"}}>
      {labels.map((l,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
            <div style={{
              width:i===current?"44px":"10px", height:"10px", borderRadius:"999px",
              background:i<current?"linear-gradient(90deg,#3b82f6,#8b5cf6)":i===current?"linear-gradient(90deg,#2563eb,#7c3aed,#06b6d4)":"rgba(99,140,255,0.15)",
              backgroundSize:i===current?"200% 100%":"100% 100%",
              animation:i===current?"gradFlow 2s ease infinite":"none",
              boxShadow:i===current?"0 0 18px #3b82f688":i<current?"0 0 8px #3b82f655":"none",
              transition:"all 0.45s cubic-bezier(0.34,1.56,0.64,1)"
            }}/>
            <span style={{fontSize:"9px",letterSpacing:"1.2px",color:i===current?"#93c5fd":i<current?"rgba(59,130,246,0.6)":"rgba(150,180,255,0.25)",fontFamily:"'Syne',sans-serif",fontWeight:600,transition:"color 0.3s",whiteSpace:"nowrap"}}>{l}</span>
          </div>
          {i<2&&<div style={{width:"40px",height:"1px",background:"rgba(99,140,255,0.1)",margin:"0 4px 14px"}}/>}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LOADING STATE
══════════════════════════════════════════════════════ */
function LoadingState() {
  const msgs = ["Analysing brand DNA…","Building tone profile…","Crafting viral hooks…","Polishing 10 tweets…"];
  const [msg,setMsg]=useState(0);
  useEffect(()=>{
    const t=setInterval(()=>setMsg(p=>(p+1)%msgs.length),1200);
    return()=>clearInterval(t);
  },[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 0 32px",gap:"22px",animation:"fadeIn 0.4s ease"}}>
      <div style={{position:"relative",width:"80px",height:"80px"}}>
        {[["80px","#3b82f6","1s",false],["58px","#8b5cf6","0.7s",true],["38px","#06b6d4","0.45s",false]].map(([s,c,d,rev],i)=>(
          <div key={i} style={{position:"absolute",top:`${(80-parseInt(s))/2}px`,left:`${(80-parseInt(s))/2}px`,width:s,height:s,borderRadius:"50%",border:"2px solid transparent",borderTop:`2px solid ${c}`,animation:`spinRing ${d} linear infinite ${rev?"reverse":""}`}}/>
        ))}
        <div style={{position:"absolute",inset:"26px",borderRadius:"50%",background:"radial-gradient(circle,#3b82f444,transparent)",animation:"blink 1.8s ease-in-out infinite"}}/>
      </div>
      <div style={{fontSize:"11px",letterSpacing:"2.5px",textTransform:"uppercase",fontFamily:"'Syne',sans-serif",fontWeight:700,background:"linear-gradient(90deg,rgba(147,197,253,0.2) 25%,#93c5fd 50%,rgba(147,197,253,0.2) 75%)",backgroundSize:"200% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 1.8s ease-in-out infinite"}}>
        {msgs[msg]}
      </div>
      <div style={{display:"flex",gap:"7px"}}>
        {[0,1,2,3,4].map(i=><div key={i} style={{width:"4px",height:"4px",borderRadius:"50%",background:"#3b82f6",animation:"blink 1.4s ease-in-out infinite",animationDelay:`${i*.15}s`}}/>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   VOICE SUMMARY CARD  ← assignment: 3-4 bullet points
══════════════════════════════════════════════════════ */
function VoiceCard({ voice, brandName }) {
  const icons = { tone:"🎭", audience:"🎯", themes:"🧵", personality:"⚡" };
  const colors = ["#3b82f6","#8b5cf6","#06b6d4","#a855f7"];
  const entries = Object.entries(voice);

  return (
    <TiltCard glow="#8b5cf6" style={{padding:"28px",marginBottom:"28px"}}>
      {/* header */}
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#8b5cf6",boxShadow:"0 0 14px #8b5cf6",animation:"blink 2s ease infinite"}}/>
        <span style={{fontSize:"10px",color:"#c4b5fd",letterSpacing:"3px",fontFamily:"'Syne',sans-serif",fontWeight:700}}>
          BRAND VOICE ANALYSIS
        </span>
        {brandName && (
          <div style={{marginLeft:"auto",padding:"3px 12px",background:"rgba(139,92,246,0.14)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:"999px",fontSize:"9px",color:"#c4b5fd",letterSpacing:"1px",fontFamily:"'Syne',sans-serif",fontWeight:600,animation:"floatY 3s ease-in-out infinite"}}>
            {brandName.toUpperCase()}
          </div>
        )}
      </div>
      <p style={{fontSize:"11px",color:"rgba(150,180,255,0.35)",letterSpacing:"0.5px",marginBottom:"20px",fontFamily:"'DM Sans',sans-serif"}}>
        A summary of the inferred brand personality, audience & content approach
      </p>

      {/* 4 bullet cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
        {entries.map(([k,v],i)=>(
          <div key={k} style={{background:`linear-gradient(135deg,${colors[i]}0d,transparent)`,border:`1px solid ${colors[i]}28`,borderRadius:"14px",padding:"14px 16px",animation:`fadeUp 0.4s ease ${i*80}ms both`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:"40px",height:"40px",background:`radial-gradient(circle at 100% 0%,${colors[i]}20,transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"7px"}}>
              <span style={{fontSize:"14px"}}>{icons[k]||"•"}</span>
              <span style={{fontSize:"9px",color:colors[i],letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Syne',sans-serif",fontWeight:700}}>{k}</span>
            </div>
            <p style={{fontSize:"12.5px",color:"rgba(200,220,255,0.84)",lineHeight:1.55,margin:0}}>{v}</p>
          </div>
        ))}
      </div>
    </TiltCard>
  );
}

/* ══════════════════════════════════════════════════════
   TWEET ROW — style label matches assignment exactly
══════════════════════════════════════════════════════ */
function TweetRow({ tweet, index, visible }) {
  const [copied,setCopied]=useState(false);
  const [h,setH]=useState(false);
  const color = PALETTE[index % PALETTE.length];
  const pct = Math.min(tweet.length/280,1);
  const copy = () => { navigator.clipboard.writeText(tweet); setCopied(true); setTimeout(()=>setCopied(false),1600); };

  return (
    <div
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        opacity:visible?1:0,
        animation:visible?`tweetIn 0.45s cubic-bezier(0.22,1,0.36,1) ${index*60}ms both`:"none",
        background:h?"rgba(25,45,110,0.6)":"rgba(15,28,72,0.45)",
        backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
        border:`1px solid rgba(99,140,255,${h?.18:.07})`,
        borderLeft:`3px solid ${color}`,
        borderRadius:"14px", padding:"14px 16px", marginBottom:"8px",
        transition:"background 0.2s,border-color 0.2s,box-shadow 0.2s",
        boxShadow:h?`0 8px 32px rgba(0,0,30,0.5),0 0 24px ${color}18`:"0 2px 10px rgba(0,0,20,0.3)",
        position:"relative", overflow:"hidden"
      }}>
      {h&&<div style={{position:"absolute",bottom:0,left:0,height:"1px",background:`linear-gradient(90deg,${color},transparent)`,animation:"scanLine 0.4s ease forwards"}}/>}

      <div style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
        {/* index badge */}
        <div style={{minWidth:"28px",height:"28px",borderRadius:"8px",background:`${color}18`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color,fontFamily:"'Syne',sans-serif",flexShrink:0}}>
          {String(index+1).padStart(2,"0")}
        </div>

        <div style={{flex:1,minWidth:0}}>
          {/* style label — exact assignment categories */}
          <div style={{fontSize:"8px",letterSpacing:"2px",textTransform:"uppercase",color,opacity:0.8,marginBottom:"8px",fontFamily:"'Syne',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:"6px"}}>
            <span style={{width:"5px",height:"5px",borderRadius:"50%",background:color,display:"inline-block",flexShrink:0}}/>
            {TWEET_STYLES[index]}
          </div>

          {/* tweet text */}
          <p style={{margin:0,fontSize:"13.5px",lineHeight:1.7,color:"rgba(210,230,255,0.9)",fontFamily:"'DM Sans',sans-serif",wordBreak:"break-word"}}>{tweet}</p>

          {/* char bar */}
          <div style={{marginTop:"10px",display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{flex:1,height:"2px",background:"rgba(99,140,255,0.1)",borderRadius:"999px",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct*100}%`,background:pct>.9?"#ef4444":pct>.7?"#f59e0b":color,borderRadius:"999px",transition:"width 0.3s"}}/>
            </div>
            <span style={{fontSize:"9px",color:"rgba(150,180,255,0.28)",fontFamily:"'Syne',sans-serif",minWidth:"32px",textAlign:"right"}}>{tweet.length}/280</span>
          </div>
        </div>

        {/* copy button */}
        <button onClick={copy} style={{
          padding:"7px 11px",borderRadius:"8px",
          background:copied?`${color}22`:"rgba(59,130,246,0.07)",
          border:`1px solid ${copied?color:"rgba(99,140,255,0.14)"}`,
          color:copied?color:"rgba(150,180,255,0.38)",
          fontSize:"11px",fontFamily:"'Syne',sans-serif",
          transition:"all 0.2s",flexShrink:0,whiteSpace:"nowrap",
          transform:copied?"scale(1.06)":"scale(1)"
        }}>{copied?"✓ done":"copy"}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DIVIDER
══════════════════════════════════════════════════════ */
function Divider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"16px"}}>
      <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,rgba(59,130,246,0.5),transparent)"}}/>
      <span style={{fontSize:"9px",letterSpacing:"3px",color:"rgba(150,180,255,0.32)",fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
      <div style={{flex:1,height:"1px",background:"linear-gradient(90deg,transparent,rgba(59,130,246,0.5))"}}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
export default function App() {
  const [step, setStep]     = useState(0);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState("");
  const [result, setResult] = useState(null);
  const [shown, setShown]   = useState([]);
  const [allCopied, setAllCopied] = useState(false);

  /* form state */
  const [brandName, setBrandName] = useState("");
  const [industry,  setIndustry]  = useState("");
  const [products,  setProducts]  = useState("");
  const [objective, setObj]       = useState("");
  const [tones,     setTones]     = useState([]);
  const [audience,  setAudience]  = useState("");
  const [themes,    setThemes]    = useState("");

  const toggleTone = t => setTones(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);

  /* ── PROMPT — covers all 4 tweet styles + voice summary ── */
  const buildPrompt = () => `You are a senior brand strategist and viral social media copywriter.

BRAND BRIEF:
- Brand Name: ${brandName || "(not specified — infer from industry)"}
- Industry: ${industry || "(not specified)"}
- Products/Services: ${products || "(not specified)"}
- Campaign Objective: ${objective || "General brand awareness"}
- Brand Tone: ${tones.length ? tones.join(", ") : "(infer from brand context)"}
- Target Audience: ${audience || "(infer from brand context)"}
- Content Themes: ${themes || "(infer from brand context)"}

YOUR TASK:
1. Infer the brand voice from the brief above.
2. Generate EXACTLY 10 tweets in this brand's voice.

TWEET STYLE ORDER (must follow exactly):
1. engaging / conversational
2. promotional
3. witty / meme-style
4. informative / value-driven
5. engaging / conversational
6. promotional
7. witty / meme-style
8. informative / value-driven
9. engaging / conversational
10. promotional

TWEET RULES:
- MAX 280 characters per tweet (hard limit)
- Max 2 hashtags per tweet, placed naturally
- NEVER start with: "We're excited", "Introducing", "Check out", "Announcing", "Thrilled to"
- Each tweet must feel DISTINCT — no repetition
- Write like the brand's best social media manager — punchy, real, shareable

OUTPUT: Respond ONLY in this exact JSON format. No markdown. No explanation. Start with { end with }:
{"brand_voice":{"tone":"describe in one sharp sentence","audience":"describe in one sharp sentence","themes":"describe in one sharp sentence","personality":"describe in one sharp sentence"},"tweets":["tweet1","tweet2","tweet3","tweet4","tweet5","tweet6","tweet7","tweet8","tweet9","tweet10"]}`;

  /* ── GENERATE ── */
const generate = async () => {
  setLoad(true);
  setError("");
  setResult(null);
  setShown([]);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: buildPrompt()
          }
        ]
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    const raw = data.choices[0].message.content.trim();

    const clean = raw
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch {
      throw new Error("AI returned invalid JSON. Try again.");
    }

    if (!parsed.tweets || parsed.tweets.length < 10) {
      throw new Error("Incomplete AI response");
    }

    parsed.tweets = parsed.tweets.slice(0, 10);

    setResult(parsed);
    setStep(2);

    parsed.tweets.forEach((_, i) =>
      setTimeout(() => setShown(p => [...p, i]), 180 + i * 95)
    );

  } catch (e) {
    setError(e.message || "Something went wrong.");
  }

  setLoad(false);
};
  const reset = () => {
    setStep(0); setResult(null); setShown([]); setError(""); setAllCopied(false);
    setBrandName(""); setIndustry(""); setProducts(""); setObj(""); setTones([]); setAudience(""); setThemes("");
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      `Brand Voice Analysis — ${brandName || "Your Brand"}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...Object.entries(result.brand_voice).map(([k,v]) => `• ${k.toUpperCase()}: ${v}`),
      ``,
      `10 On-Brand Tweets`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...result.tweets.map((t, i) => `${i+1}. [${TWEET_STYLES[i].toUpperCase()}]\n   ${t}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2200);
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{CSS}</style>

      {/* 3D SCENE */}
      <SocialMediaSpaceScene />

      {/* atmosphere overlay */}
      <div style={{
        position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
        background:`
          radial-gradient(ellipse at 18% 45%, rgba(29,78,216,0.14) 0%, transparent 52%),
          radial-gradient(ellipse at 82% 18%, rgba(124,58,237,0.11) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 88%, rgba(6,182,212,0.08) 0%, transparent 50%),
          linear-gradient(180deg,rgba(3,7,18,0.25) 0%,rgba(3,7,18,0.1) 100%)
        `
      }}/>

      {/* CONTENT */}
      <div style={{
  position:"relative",
  zIndex:2,
  maxWidth:"1200px",
  margin:"0 auto",
  padding:"44px 20px 120px",
  minHeight:"100vh",
  display:"flex",
  flexDirection:"column",
  alignItems:"center",
  justifyContent:"center"
}}>

        {/* ── HERO ── */}
        <div style={{textAlign:"center",marginBottom:"48px",animation:"fadeUp 0.65s ease both"}}>
          {/* floating badge with all platform icons */}
          <div style={{display:"inline-flex",alignItems:"center",gap:"10px",background:"rgba(29,78,216,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"999px",padding:"6px 20px",marginBottom:"24px",boxShadow:"0 0 32px rgba(29,78,216,0.2)",animation:"floatY 4s ease-in-out infinite"}}>
            {/* Twitter X */}
            <svg width="13" height="13" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.863L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#93c5fd"/></svg>
            {/* Instagram */}
            <svg width="13" height="13" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="#f472b6" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="#f472b6" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="#f472b6"/></svg>
            {/* LinkedIn */}
            <svg width="13" height="13" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#60a5fa"/><rect x="6" y="10" width="2.5" height="8" fill="white"/><circle cx="7.25" cy="7.25" r="1.5" fill="white"/><path d="M12 10h2.5v1.5s.5-1.5 2.5-1.5c2 0 3 1.2 3 3.5V18H17v-4c0-1-.5-1.8-1.5-1.8S14 13 14 14v4h-2z" fill="white"/></svg>
            {/* YouTube */}
            <svg width="13" height="13" viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="4" fill="#ef4444"/><polygon points="10,8.5 16,12 10,15.5" fill="white"/></svg>
            {/* TikTok */}
            <svg width="13" height="13" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z" fill="#c084fc"/></svg>
            <span style={{fontSize:"10px",color:"#93c5fd",letterSpacing:"3px",fontFamily:"'Syne',sans-serif",fontWeight:700}}>AI · TWEET · ENGINE</span>
          </div>

          <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(38px,7.5vw,66px)",lineHeight:1.05,letterSpacing:"-2.5px",marginBottom:"18px"}}>
            <span style={{background:"linear-gradient(135deg,#93c5fd 0%,#c4b5fd 38%,#67e8f9 72%,#bfdbfe 100%)",backgroundSize:"200% 200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"gradFlow 5s ease infinite"}}>Brand Voice</span>
            <br/>
            <span style={{color:"rgba(218,232,255,0.95)"}}>Tweet Generator</span>
          </h1>

          <p style={{fontSize:"14.5px",color:"rgba(150,180,255,0.42)",maxWidth:"400px",margin:"0 auto",lineHeight:1.75,fontWeight:300}}>
            Drop your brand DNA — get 10 tweets across all styles that sound unmistakably{" "}
            <em style={{color:"rgba(147,197,253,0.72)",fontStyle:"normal",fontWeight:500}}>you</em>.
          </p>

          {/* social platforms row */}
          <div style={{display:"flex",justifyContent:"center",gap:"10px",marginTop:"20px",flexWrap:"wrap"}}>
            {[
              {icon:"𝕏",label:"Twitter",c:"#1d9bf0"},
              {icon:"📸",label:"Instagram",c:"#e1306c"},
              {icon:"in",label:"LinkedIn",c:"#0a66c2"},
              {icon:"▶",label:"YouTube",c:"#ff0000"},
              {icon:"f",label:"Facebook",c:"#1877f2"},
              {icon:"♪",label:"TikTok",c:"#c084fc"},
            ].map(({icon,label,c})=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"999px",fontSize:"10px",color:"rgba(200,220,255,0.4)"}}>
                <span style={{color:c,fontSize:"11px"}}>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>

        {step < 2 && <Steps current={step} />}

        {/* ════ STEP 0 — Brand Info ════ */}
        {step === 0 && (
          <div style={{animation:"fadeUp 0.4s ease both"}}>
            <TiltCard glow="#3b82f6" style={{padding:"32px 32px 28px",marginBottom:"16px"}}>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"15px",color:"#93c5fd",marginBottom:"28px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"18px"}}>🏷️</span> Tell us about your brand
              </h2>
              <FloatInput label="Brand Name" value={brandName} onChange={setBrandName} placeholder="Zomato, Apple, Cred, Nike…" color="#3b82f6"/>
              <div style={{marginBottom:"22px"}}>
                <p style={{fontSize:"9.5px",color:"rgba(150,180,255,0.35)",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"12px"}}>Industry / Category</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
                  {INDUSTRIES.map(i=><Chip key={i} label={i} selected={industry===i} onClick={()=>setIndustry(i===industry?"":i)} color="#8b5cf6"/>)}
                </div>
              </div>
              <FloatInput label="Products / Services" value={products} onChange={setProducts} placeholder="What does your brand sell or offer?" multiline color="#3b82f6"/>
              <div>
                <p style={{fontSize:"9.5px",color:"rgba(150,180,255,0.35)",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"12px"}}>Campaign Objective</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
                  {OBJECTIVES.map(o=><Chip key={o} label={o} selected={objective===o} onClick={()=>setObj(o===objective?"":o)} color="#06b6d4"/>)}
                </div>
              </div>
            </TiltCard>
            <NeonBtn full onClick={()=>setStep(1)} color1="#1d4ed8" color2="#7c3aed" glow="#3b82f655">
              NEXT: DEFINE VOICE →
            </NeonBtn>
          </div>
        )}

        {/* ════ STEP 1 — Voice Setup ════ */}
        {step === 1 && (
          <div style={{animation:"fadeUp 0.4s ease both"}}>
            <TiltCard glow="#8b5cf6" style={{padding:"32px 32px 28px",marginBottom:"16px"}}>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"15px",color:"#c4b5fd",marginBottom:"28px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"18px"}}>🎙️</span> Define the brand voice
              </h2>
              <div style={{marginBottom:"22px"}}>
                <p style={{fontSize:"9.5px",color:"rgba(150,180,255,0.35)",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:"12px"}}>
                  Brand Tone <span style={{color:"rgba(150,180,255,0.22)",fontWeight:400,textTransform:"none",letterSpacing:"0",fontSize:"11px"}}>— pick all that apply</span>
                </p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
                  {TONES.map(t=><Chip key={t} label={t} selected={tones.includes(t)} onClick={()=>toggleTone(t)} color="#a855f7"/>)}
                </div>
              </div>
              <FloatInput label="Target Audience" value={audience} onChange={setAudience} placeholder="Gen Z foodies, startup founders, busy parents…" color="#8b5cf6"/>
              <FloatInput label="Content Themes" value={themes} onChange={setThemes} placeholder="Deals, launches, memes, behind-the-scenes, tips…" multiline color="#8b5cf6"/>
            </TiltCard>

            {error && (
              <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.28)",borderRadius:"12px",padding:"12px 16px",marginBottom:"14px",color:"#fca5a5",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",animation:"fadeIn 0.3s ease",display:"flex",alignItems:"center",gap:"8px"}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <div style={{display:"flex",gap:"12px"}}>
              <GhostBtn onClick={()=>{setStep(0);setError("");}}>← BACK</GhostBtn>
              <NeonBtn full onClick={generate} disabled={loading} color1="#5b21b6" color2="#1d4ed8" glow="#8b5cf655" style={{flex:1}}>
                {loading
                  ? <><span style={{width:"15px",height:"15px",borderRadius:"50%",border:"2.5px solid rgba(255,255,255,0.35)",borderTop:"2.5px solid #fff",animation:"spinRing 0.75s linear infinite",flexShrink:0}}/> GENERATING TWEETS…</>
                  : "✦ GENERATE 10 TWEETS"
                }
              </NeonBtn>
            </div>
            {loading && <LoadingState/>}
          </div>
        )}

        {/* ════ STEP 2 — Results ════ */}
        {step === 2 && result && (
          <div style={{animation:"fadeUp 0.5s ease both"}}>

            {/* VOICE SUMMARY — 4 bullet points (assignment: 3-4) */}
            <VoiceCard voice={result.brand_voice} brandName={brandName}/>

            {/* TWEETS HEADER */}
            <Divider label={`10 ON-BRAND TWEETS · ${(brandName||"YOUR BRAND").toUpperCase()}`}/>

            {/* style legend */}
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"16px"}}>
              {["engaging / conversational","promotional","witty / meme-style","informative / value-driven"].map((s,i)=>(
                <div key={s} style={{padding:"3px 10px",background:`${PALETTE[i]}12`,border:`1px solid ${PALETTE[i]}30`,borderRadius:"999px",fontSize:"9px",color:PALETTE[i],fontFamily:"'Syne',sans-serif",fontWeight:600,letterSpacing:"0.5px"}}>
                  {s}
                </div>
              ))}
            </div>

            {/* 10 TWEETS */}
            {result.tweets.map((t,i)=>(
              <TweetRow key={i} tweet={t} index={i} visible={shown.includes(i)}/>
            ))}

            {/* ACTIONS */}
            <div style={{display:"flex",gap:"12px",marginTop:"28px"}}>
              <GhostBtn onClick={reset}>← NEW BRAND</GhostBtn>
              <NeonBtn full onClick={copyAll} color1={allCopied?"#059669":"#1d4ed8"} color2={allCopied?"#047857":"#7c3aed"} glow={allCopied?"#10b98155":"#3b82f655"} style={{flex:1}}>
                {allCopied?"✓ COPIED — PASTE ANYWHERE":"COPY ALL + VOICE SUMMARY ↗"}
              </NeonBtn>
            </div>

            {/* STATS */}
            <div style={{display:"flex",marginTop:"22px",padding:"18px 24px",background:"rgba(12,22,58,0.6)",border:"1px solid rgba(99,140,255,0.1)",borderRadius:"18px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
              {[
                {v:10,            l:"Tweets"},
                {v:Math.round(result.tweets.reduce((a,t)=>a+t.length,0)/10), l:"Avg Chars"},
                {v:result.tweets.filter(t=>t.includes("#")).length, l:"Hashtag Tweets"},
                {v:4,             l:"Style Types"},
              ].map(({v,l},i)=>(
                <div key={l} style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid rgba(99,140,255,0.1)":"none",padding:"0 10px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"24px",background:"linear-gradient(135deg,#93c5fd,#c4b5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:`countUp 0.5s ease ${i*100}ms both`}}>{v}</div>
                  <div style={{fontSize:"9px",color:"rgba(150,180,255,0.28)",letterSpacing:"0.8px",marginTop:"3px",fontFamily:"'Syne',sans-serif"}}>{l}</div>
                </div>
              ))}
            </div>

            <p style={{textAlign:"center",marginTop:"20px",fontSize:"9px",color:"rgba(150,180,255,0.13)",letterSpacing:"2px",fontFamily:"'Syne',sans-serif"}}>
              POWERED BY CLAUDE SONNET · BUILT FOR CONFLUENCR INTERNSHIP ASSIGNMENT
            </p>
          </div>
        )}
      </div>
    </>
  );
}

