import React, { useRef, useEffect, useCallback } from 'react';

const VERT = `#version 300 es
in vec2 a_position;
void main(){gl_Position=vec4(a_position,0,1);}`;

const FRAG = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
out vec4 o;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 r=mat2(.8,.6,-.6,.8);
  for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.;a*=.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time*.08;
  
  // Pointer influence
  vec2 ptr=(u_pointer/u_resolution)-.5;
  vec2 warp=uv+ptr*.15;
  
  float f1=fbm(warp*3.+t);
  float f2=fbm(warp*3.+f1*1.5+t*.7);
  float f3=fbm(warp*4.+f2*1.2-t*.5);
  
  // Warm palette: cream → terracotta → sage
  vec3 cream=vec3(.992,.965,.933);    // #FDF6EE
  vec3 terra=vec3(.769,.439,.294);    // #C4704B
  vec3 sage=vec3(.486,.604,.510);     // #7C9A82
  vec3 warm=vec3(.894,.776,.667);     // soft peach
  
  vec3 col=mix(cream,warm,f1);
  col=mix(col,terra,f2*.4);
  col=mix(col,sage,f3*.25);
  
  // Vignette
  float vig=1.-length((uv-.5)*1.4);
  col*=smoothstep(0.,.7,vig);
  
  o=vec4(col,1);
}`;

export function AnimatedShaderHero({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const handlePointer = useCallback((e: PointerEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return;

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

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uPtr = gl.getUniformLocation(prog, 'u_pointer');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointer);

    const t0 = performance.now();
    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uPtr, pointer.current.x * (canvas.width / canvas.clientWidth), pointer.current.y * (canvas.height / canvas.clientHeight));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointer);
    };
  }, [handlePointer]);

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
