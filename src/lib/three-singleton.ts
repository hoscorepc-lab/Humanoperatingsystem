// Three.js Singleton Module
// This ensures only ONE instance of Three.js is ever loaded in the application
// Import this module instead of importing 'three' directly

type ThreeModule = typeof import('three');
type OrbitControlsType = typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;

let threeInstance: ThreeModule | null = null;
let orbitControlsClass: OrbitControlsType | null = null;
let loadPromise: Promise<{ THREE: ThreeModule; OrbitControls: OrbitControlsType }> | null = null;

/**
 * Load Three.js as a singleton.
 * This function ensures that Three.js is only imported once,
 * preventing the "Multiple instances of Three.js being imported" warning.
 */
export async function loadThreeJS(): Promise<{ THREE: ThreeModule; OrbitControls: OrbitControlsType }> {
  // If already loaded, return immediately
  if (threeInstance && orbitControlsClass) {
    return { THREE: threeInstance, OrbitControls: orbitControlsClass };
  }

  // If currently loading, wait for the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Start loading and cache the promise
  loadPromise = (async () => {
    try {
      // Load both Three.js and OrbitControls in parallel
      const [threeModule, controlsModule] = await Promise.all([
        import('three'),
        import('three/examples/jsm/controls/OrbitControls.js')
      ]);

      // Cache the loaded modules
      threeInstance = threeModule;
      orbitControlsClass = controlsModule.OrbitControls;

      return { THREE: threeInstance, OrbitControls: orbitControlsClass };
    } catch (error) {
      // Reset on error so it can be retried
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Check if Three.js has been loaded
 */
export function isThreeLoaded(): boolean {
  return threeInstance !== null && orbitControlsClass !== null;
}

/**
 * Get the cached Three.js instance (if loaded)
 * Returns null if not yet loaded
 */
export function getThreeInstance(): ThreeModule | null {
  return threeInstance;
}

/**
 * Get the cached OrbitControls class (if loaded)
 * Returns null if not yet loaded
 */
export function getOrbitControlsClass(): OrbitControlsType | null {
  return orbitControlsClass;
}
