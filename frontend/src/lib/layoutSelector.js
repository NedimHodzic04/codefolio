import DefaultLayout from "@/components/layouts/DefaultLayout";
import MinimalLayout from "@/components/layouts/MinimalLayout";
import ModernLayout from "@/components/layouts/ModernLayout";
import ClassicLayout from "@/components/layouts/ClassicLayout";

/**
 * Layout component mapping
 * Note: Using old component names but mapping to new layout IDs
 * DefaultLayout -> spotlight, ModernLayout -> grid, ClassicLayout -> timeline
 */
const layouts = {
  spotlight: DefaultLayout,
  minimal: MinimalLayout,
  grid: ModernLayout,
  timeline: ClassicLayout,
};

// Migration map for old layout names
const LAYOUT_MIGRATION = {
  default: "spotlight",
  modern: "grid",
  classic: "timeline",
  minimal: "minimal",
};

/**
 * Normalize old layout names to new ones
 */
function normalizeLayout(layoutTemplate) {
  if (!layoutTemplate) return "spotlight";
  const normalized = layoutTemplate.toLowerCase();
  return LAYOUT_MIGRATION[normalized] || normalized;
}

/**
 * Get layout component based on layout template name
 * @param {string} layoutTemplate - The name of the layout template
 * @returns {React.Component} Layout component
 */
export function getLayoutComponent(layoutTemplate) {
  // Normalize old values to new values
  const normalizedLayout = normalizeLayout(layoutTemplate);
  
  if (!layouts[normalizedLayout]) {
    console.warn(`Invalid layout template "${layoutTemplate}", falling back to "spotlight"`);
    return layouts.spotlight;
  }
  
  return layouts[normalizedLayout];
}

/**
 * Get list of available layout template names
 * @returns {string[]} Array of layout names
 */
export function getAvailableLayouts() {
  return Object.keys(layouts);
}

/**
 * Check if a layout template name is valid
 * @param {string} layoutTemplate - The layout template name to validate
 * @returns {boolean} True if layout exists
 */
export function isValidLayout(layoutTemplate) {
  return layouts.hasOwnProperty(layoutTemplate?.toLowerCase());
}
