/**
 * UUID 生成工具
 * 支持浏览器和 Node.js 环境
 */

/**
 * 生成 UUID
 * 优先使用 crypto.randomUUID()，如果不支持则使用 fallback
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

