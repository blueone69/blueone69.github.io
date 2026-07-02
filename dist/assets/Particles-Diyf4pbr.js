import{m as y,r as c,l as d,bG as w,c as g,aV as C}from"./three.core-MjEdqQnE.js";const i=4e3,b=`
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Individual drift per particle using seed
    float seed = aSeed;
    float speed = 0.08 + seed * 0.12;
    float drift = sin(uTime * speed + seed * 6.2831) * 1.2;
    float driftZ = cos(uTime * speed * 0.7 + seed * 3.14) * 0.6;

    // Cycle length 24 units. seed * 24 randomises starting phase.
    float cycleLen = 24.0;
    float cyclePos = mod(uTime * (0.04 + seed * 0.06) + seed * cycleLen, cycleLen);

    vec3 pos = position;
    pos.x += drift * 0.5;
    // Y is driven entirely by the cycle in absolute world space (-14 → +10).
    // This guarantees the hard wrap only fires when cyclePos wraps 24→0,
    // exactly when cycleFade is already 0 — so the teleport is never visible.
    pos.y  = cyclePos - 14.0;
    pos.z += driftZ;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Distance-based size attenuation
    float dist = -mvPos.z;
    gl_PointSize = uSize * (300.0 / dist);

    // Fade near camera and far away
    vAlpha = smoothstep(0.0, 2.0, dist) * smoothstep(30.0, 10.0, dist);
    vAlpha *= 0.4 + seed * 0.6;

    // Fade in over first 4 units of cycle, fade out over last 4 — completely
    // hides the wrap since alpha = 0 exactly when cyclePos resets to 0.
    float cycleFade = smoothstep(0.0, 4.0, cyclePos) * smoothstep(cycleLen, cycleLen - 4.0, cyclePos);
    vAlpha *= cycleFade;
  }
`,P=`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular point
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float dist = dot(uv, uv);
    if (dist > 1.0) discard;

    float alpha = (1.0 - dist) * vAlpha;
    // Bloom core: bright center
    float core = pow(1.0 - dist, 3.0) * 0.8;
    vec3 col = mix(vColor, vec3(1.0), core);

    gl_FragColor = vec4(col, alpha);
  }
`;let r;function x(l){const o=new y,a=new Float32Array(i*3),f=new Float32Array(i),s=new Float32Array(i*3),p=new c(54527),u=new c(8061183),m=new c(16711808);for(let e=0;e<i;e++){a[e*3]=(Math.random()-.5)*40,a[e*3+1]=(Math.random()-.5)*24+4,a[e*3+2]=(Math.random()-.5)*20-5,f[e]=Math.random();const v=Math.random();let t;v<.55?t=p:v<.88?t=u:t=m;const n=.6+Math.random()*.4;s[e*3]=t.r*n,s[e*3+1]=t.g*n,s[e*3+2]=t.b*n}o.setAttribute("position",new d(a,3)),o.setAttribute("aSeed",new d(f,1)),o.setAttribute("aColor",new d(s,3));const h=new w({vertexShader:b,fragmentShader:P,uniforms:{uTime:{value:0},uSize:{value:2.5}},transparent:!0,depthWrite:!1,blending:g,vertexColors:!1});r=new C(o,h),l.add(r)}function S(l){r&&(r.material.uniforms.uTime.value=l)}export{x as initParticles,S as updateParticles};
