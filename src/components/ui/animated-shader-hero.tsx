import React, { useRef, useEffect } from 'react';

const VERT = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
uniform vec2 move;
uniform int pointerCount;
uniform vec2 pointers[10];
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
  }
  O=vec4(col,1);
}`;

export function AnimatedShaderHero({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return;

    // Compile shader
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'time');
    const uRes = gl.getUniformLocation(prog, 'resolution');
    const uTouch = gl.getUniformLocation(prog, 'touch');
    const uMove = gl.getUniformLocation(prog, 'move');
    const uPointerCount = gl.getUniformLocation(prog, 'pointerCount');

    // Pointer state
    let pointerActive = false;
    const pointerPos = [0, 0];
    const moveAccum = [0, 0];

    const mapPointer = (x: number, y: number) => {
      const dpr = canvas.width / canvas.clientWidth;
      return [x * dpr, canvas.height - y * dpr];
    };

    const onDown = (e: PointerEvent) => {
      pointerActive = true;
      const [px, py] = mapPointer(e.clientX, e.clientY);
      pointerPos[0] = px;
      pointerPos[1] = py;
    };
    const onUp = () => { pointerActive = false; };
    const onMove = (e: PointerEvent) => {
      if (!pointerActive) return;
      const [px, py] = mapPointer(e.clientX, e.clientY);
      pointerPos[0] = px;
      pointerPos[1] = py;
      moveAccum[0] += e.movementX;
      moveAccum[1] += e.movementY;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.addEventListener('pointermove', onMove);

    // Resize
    const resize = () => {
      const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Render loop
    const draw = (now: number) => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform1f(uTime, now * 1e-3);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uTouch, pointerPos[0], pointerPos[1]);
      gl.uniform2f(uMove, moveAccum[0], moveAccum[1]);
      gl.uniform1i(uPointerCount, pointerActive ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
