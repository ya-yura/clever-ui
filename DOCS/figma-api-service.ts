/**
 * Figma API Service
 * Прямая работа с Figma REST API без MCP
 */

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_TOKEN = 'figd_765gcNmhaoTfZ8CmJtcmS5EXvg3m3VljhS6Kzw6n';

interface FigmaFile {
  document: any;
  components: Record<string, any>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  styles?: Record<string, string>;
  [key: string]: any;
}

/**
 * Получить файл Figma
 */
async function getFigmaFile(fileKey: string): Promise<FigmaFile> {
  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Получить конкретные ноды
 */
async function getFigmaNodes(fileKey: string, nodeIds: string[]): Promise<any> {
  const ids = nodeIds.join(',');
  const response = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${ids}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Получить изображения нод
 */
async function getFigmaImages(
  fileKey: string,
  nodeIds: string[],
  options: {
    format?: 'png' | 'jpg' | 'svg' | 'pdf';
    scale?: number;
  } = {}
): Promise<Record<string, string>> {
  const { format = 'png', scale = 2 } = options;
  const ids = nodeIds.join(',');
  
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.images;
}

/**
 * Извлечь цвета из файла
 */
function extractColors(node: FigmaNode, colors: Set<string> = new Set()): Set<string> {
  // Fills
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b, a = 1 } = fill.color;
        const hex = rgbaToHex(r, g, b, a);
        colors.add(hex);
      }
    });
  }

  // Strokes
  if (node.strokes && Array.isArray(node.strokes)) {
    node.strokes.forEach(stroke => {
      if (stroke.type === 'SOLID' && stroke.color) {
        const { r, g, b, a = 1 } = stroke.color;
        const hex = rgbaToHex(r, g, b, a);
        colors.add(hex);
      }
    });
  }

  // Рекурсивно для детей
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => extractColors(child, colors));
  }

  return colors;
}

/**
 * Извлечь типографику из файла
 */
function extractTypography(node: FigmaNode, typography: any[] = []): any[] {
  if (node.type === 'TEXT' && node.style) {
    typography.push({
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
    });
  }

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => extractTypography(child, typography));
  }

  return typography;
}

/**
 * Извлечь spacing (отступы)
 */
function extractSpacing(node: FigmaNode, spacings: Set<number> = new Set()): Set<number> {
  // Padding
  if (node.paddingLeft) spacings.add(node.paddingLeft);
  if (node.paddingRight) spacings.add(node.paddingRight);
  if (node.paddingTop) spacings.add(node.paddingTop);
  if (node.paddingBottom) spacings.add(node.paddingBottom);

  // Item spacing
  if (node.itemSpacing) spacings.add(node.itemSpacing);

  // Рекурсивно
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => extractSpacing(child, spacings));
  }

  return spacings;
}

/**
 * Извлечь border radius
 */
function extractBorderRadius(node: FigmaNode, radii: Set<number> = new Set()): Set<number> {
  if (node.cornerRadius !== undefined) {
    radii.add(node.cornerRadius);
  }

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => extractBorderRadius(child, radii));
  }

  return radii;
}

/**
 * Извлечь shadows (тени)
 */
function extractShadows(node: FigmaNode, shadows: any[] = []): any[] {
  if (node.effects && Array.isArray(node.effects)) {
    node.effects.forEach(effect => {
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        shadows.push({
          type: effect.type,
          x: effect.offset?.x || 0,
          y: effect.offset?.y || 0,
          blur: effect.radius || 0,
          spread: effect.spread || 0,
          color: effect.color ? rgbaToHex(
            effect.color.r,
            effect.color.g,
            effect.color.b,
            effect.color.a
          ) : '#000000',
        });
      }
    });
  }

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => extractShadows(child, shadows));
  }

  return shadows;
}

/**
 * Конвертация RGBA в HEX
 */
function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  if (a < 1) {
    return `${hex}${toHex(a)}`;
  }

  return hex;
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Извлечь дизайн-систему
 */
async function extractDesignSystem(fileKey: string, nodeId?: string) {
  console.log('📥 Загружаю файл Figma...');
  const file = await getFigmaFile(fileKey);

  console.log('✅ Файл загружен:', file.name);

  let rootNode: FigmaNode;
  
  if (nodeId) {
    console.log('📥 Загружаю конкретную ноду...');
    const nodes = await getFigmaNodes(fileKey, [nodeId]);
    rootNode = nodes.nodes[nodeId].document;
  } else {
    rootNode = file.document;
  }

  console.log('🎨 Извлекаю дизайн-систему...');

  const colors = Array.from(extractColors(rootNode));
  const typography = extractTypography(rootNode);
  const spacing = Array.from(extractSpacing(rootNode)).sort((a, b) => a - b);
  const borderRadius = Array.from(extractBorderRadius(rootNode)).sort((a, b) => a - b);
  const shadows = extractShadows(rootNode);

  const designSystem = {
    meta: {
      source: 'Figma',
      fileKey,
      fileName: file.name,
      extractedAt: new Date().toISOString(),
    },
    colors: {
      palette: colors,
      // Автоматическая классификация
      primary: colors[0] || '#3B82F6',
      secondary: colors[1] || '#8B5CF6',
      accent: colors[2] || '#10B981',
      neutral: colors.filter(c => isGrayscale(c)),
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
    },
    typography: {
      fontFamilies: [...new Set(typography.map(t => t.fontFamily))],
      fontSizes: [...new Set(typography.map(t => t.fontSize))].sort((a, b) => a - b),
      fontWeights: [...new Set(typography.map(t => t.fontWeight))].sort((a, b) => a - b),
      lineHeights: [...new Set(typography.map(t => t.lineHeight))].sort((a, b) => a - b),
    },
    spacing: {
      scale: spacing,
      base: spacing[0] || 4,
    },
    borderRadius: {
      scale: borderRadius,
    },
    shadows: {
      definitions: shadows,
    },
  };

  return designSystem;
}

/**
 * Проверка, является ли цвет оттенком серого
 */
function isGrayscale(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff < 10; // Tolerance
}

/**
 * ИСПОЛЬЗОВАНИЕ:
 */
async function main() {
  try {
    const fileKey = 'gwuHD3Vqm68VwQFghwNRD9';
    // Figma API требует ID в формате "123:456", а не "123-456"
    const nodeId = '11547:229'; 

    const designSystem = await extractDesignSystem(fileKey, nodeId);

    console.log('\n✅ Дизайн-система извлечена!');
    console.log(JSON.stringify(designSystem, null, 2));

    // Сохранить в файл
    // await Deno.writeTextFile('design-system.json', JSON.stringify(designSystem, null, 2));
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Запустить
main();

export {
  getFigmaFile,
  getFigmaNodes,
  getFigmaImages,
  extractDesignSystem,
  extractColors,
  extractTypography,
  extractSpacing,
  extractBorderRadius,
  extractShadows,
};


