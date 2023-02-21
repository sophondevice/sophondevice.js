/** sophon base library */
const kYGDefaultExperimentalFeatures = function () {
    return [false, false, false];
};
class YGConfig {
    experimentalFeatures;
    useWebDefaults;
    useLegacyStretchBehaviour;
    shouldDiffLayoutWithoutLegacyStretchBehaviour;
    pointScaleFactor;
    logger;
    cloneNodeCallback = null;
    context;
    constructor(logger) {
        this.experimentalFeatures = kYGDefaultExperimentalFeatures();
        this.useWebDefaults = false;
        this.useLegacyStretchBehaviour = false;
        this.shouldDiffLayoutWithoutLegacyStretchBehaviour = false;
        this.pointScaleFactor = 1.0;
        this.logger = logger;
        this.context = null;
    }
}

export { YGConfig };
//# sourceMappingURL=ygconfig.js.map
