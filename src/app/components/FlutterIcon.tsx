'use client';

/**
 * FlutterIcon — widget de ícono estilo Flutter
 *
 * Renderiza Material Symbols Rounded (la fuente de íconos que usa Flutter
 * por defecto en Material 3), con soporte para:
 *   - size: tamaño en px (default 24, igual que Flutter)
 *   - fill: 0..1 (gradiente de relleno, M3 spec)
 *   - weight: 100..700 (grueso del trazo)
 *   - grade: -25..200 (grado óptico)
 *   - opticalSize: 20..48
 *   - color: color del glifo (acepta var(--xxx))
 *
 * Equivalente aproximado en Flutter:
 *   Icon(Icons.home_rounded, size: 24, color: Colors.green, ...)
 */
export type FlutterIconProps = {
  name: string;            // nombre del símbolo, ej: "home", "search", "eco"
  size?: number;
  fill?: number;           // 0..1
  weight?: number;         // 100..700
  grade?: number;          // -25..200
  opticalSize?: number;    // 20..48
  color?: string;          // CSS color, default = currentColor
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  role?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
};

export default function FlutterIcon({
  name,
  size = 24,
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  color = 'currentColor',
  className = '',
  style,
  onClick,
  ...aria
}: FlutterIconProps) {
  const spanStyle: React.CSSProperties = {
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
    fontSize: `${size}px`,
    color,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'optimizeLegibility',
    ...style,
  };
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={spanStyle}
      onClick={onClick}
      {...aria}
    >
      {name}
    </span>
  );
}
