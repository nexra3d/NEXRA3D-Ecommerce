export const PERSONALIZATION_MARKER = '• For:';

export function formatPersonalizedProductTitle(productTitle: string, customizationText: string) {
  const trimmed = String(customizationText || '').trim();
  if (!trimmed) return productTitle;
  return `${productTitle} ${PERSONALIZATION_MARKER} ${trimmed}`;
}

export function extractCustomizationText(value: string | undefined | null) {
  if (!value) return '';
  const idx = value.indexOf(PERSONALIZATION_MARKER);
  if (idx === -1) return '';
  return value.slice(idx + PERSONALIZATION_MARKER.length).trim();
}

export function isNameKeychainProduct(product: any) {
  if (!product) return false;
  if (product.requiresCustomization === true) return true;
  const target = `${product.id || ''} ${product.slug || ''} ${product.title || ''} ${product.name || ''}`.toLowerCase();
  return target.includes('name keychain') || target.includes('customized 3d printed name keychain');
}

export function isLithophaneProduct(product: any) {
  if (!product) return false;
  if (product.requiresImageUpload === true) return true;
  const target = `${product.id || ''} ${product.slug || ''} ${product.title || ''} ${product.name || ''}`.toLowerCase();
  return target.includes('lithophane');
}
