const fs = require('fs');
const file = 'D:/web/src/pages/VIPLibrary.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add 3D Cube to Header
content = content.replace(
  '<section className="text-center max-w-4xl mx-auto space-y-6">',
  '<section className="text-center max-w-4xl mx-auto space-y-6 relative">\n        <div className="absolute top-0 right-0 -z-10 opacity-30 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">\n          <img src="/assets/quant_3d_cube.png" alt="3D Quant Cube" className="w-64 h-64 object-contain blur-[1px]" />\n        </div>'
);

// 2. Fix Header stats text-[10px] -> text-xs font-bold
content = content.replace(
  /<p className="text-\[10px\] text-gray-500 font-mono uppercase mt-1">/g,
  '<p className="text-xs text-gray-400 font-bold font-mono uppercase mt-1">'
);

// 3. Fix Table Header text-[10px] -> text-xs font-bold text-gray-300
content = content.replace(
  '<tr className="bg-[#0B0E14] text-gray-500 text-[10px] uppercase font-mono tracking-wider border-b border-[#1F2937]">',
  '<tr className="bg-[#0B0E14] text-gray-300 text-xs font-bold uppercase font-mono tracking-wider border-b border-[#1F2937]">'
);

// 4. Fix other text-[10px] -> text-xs
content = content.replace(/text-\[10px\]/g, 'text-xs');
// And change text-gray-500 to text-gray-400 for better visibility in some places
content = content.replace(/text-gray-500 font-mono/g, 'text-gray-400 font-mono');

// 5. Add IsometricBar component after VERDICT_ORDER
const isometricBarCode = `
const IsometricBar = (props: any) => {
  const { fill, x, y, width, height, payload } = props;
  if (height === 0 || isNaN(height)) return null;
  const depth = width * 0.4;
  const isPositive = payload.R >= 0;
  
  const frontTopLeft = { x, y };
  const frontTopRight = { x: x + width, y };
  const frontBottomRight = { x: x + width, y: y + height };
  const frontBottomLeft = { x, y: y + height };
  
  const backTopLeft = { x: x + depth, y: y - depth };
  const backTopRight = { x: x + width + depth, y: y - depth };
  const backBottomRight = { x: x + width + depth, y: y + height - depth };
  
  const lightFill = fill === '#1D9E75' ? '#22C55E' : '#EF4444';
  const darkFill = fill === '#1D9E75' ? '#166534' : '#991B1B';
  
  return (
    <g>
      <path d={\`M\${frontTopLeft.x},\${frontTopLeft.y} L\${frontTopRight.x},\${frontTopRight.y} L\${frontBottomRight.x},\${frontBottomRight.y} L\${frontBottomLeft.x},\${frontBottomLeft.y} Z\`} fill={fill} stroke={fill} strokeWidth={0.5} />
      {isPositive && <path d={\`M\${frontTopLeft.x},\${frontTopLeft.y} L\${backTopLeft.x},\${backTopLeft.y} L\${backTopRight.x},\${backTopRight.y} L\${frontTopRight.x},\${frontTopRight.y} Z\`} fill={lightFill} stroke={lightFill} strokeWidth={0.5} />}
      {!isPositive && <path d={\`M\${frontBottomLeft.x},\${frontBottomLeft.y} L\${x + depth},\${y + height - depth} L\${backBottomRight.x},\${backBottomRight.y} L\${frontBottomRight.x},\${frontBottomRight.y} Z\`} fill={lightFill} stroke={lightFill} strokeWidth={0.5} />}
      <path d={\`M\${frontTopRight.x},\${frontTopRight.y} L\${backTopRight.x},\${backTopRight.y} L\${backBottomRight.x},\${backBottomRight.y} L\${frontBottomRight.x},\${frontBottomRight.y} Z\`} fill={darkFill} stroke={darkFill} strokeWidth={0.5} />
    </g>
  );
};
`;

content = content.replace(
  "const VERDICT_ORDER: Record<string, number> = {\n  'CHẤT': 1, 'TÌNH HUỐNG': 2, 'CHÁT': 3, 'CHƯA KIỂM ĐỊNH': 4\n};",
  "const VERDICT_ORDER: Record<string, number> = {\n  'CHẤT': 1, 'TÌNH HUỐNG': 2, 'CHÁT': 3, 'CHƯA KIỂM ĐỊNH': 4\n};\n" + isometricBarCode
);

// 6. Replace Bar with custom shape
content = content.replace(
  /<Bar dataKey="R"[^>]*>[\s\S]*?<\/Bar>/,
  `<Bar dataKey="R" shape={<IsometricBar />}>
                        {chartData.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={entry.R >= 0 ? VERDICT_COLORS['CHẤT'] : VERDICT_COLORS['CHÁT']} />
                        ))}
                      </Bar>`
);

fs.writeFileSync(file, content);
console.log('Success');
