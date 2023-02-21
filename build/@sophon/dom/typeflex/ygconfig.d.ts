import { YGLogger, YGCloneNodeFunc } from './yoga';
declare class YGConfig {
    experimentalFeatures: Array<boolean>;
    useWebDefaults: boolean;
    useLegacyStretchBehaviour: boolean;
    shouldDiffLayoutWithoutLegacyStretchBehaviour: boolean;
    pointScaleFactor: number;
    logger: YGLogger;
    cloneNodeCallback: YGCloneNodeFunc;
    context: any;
    constructor(logger: YGLogger);
}
export { YGConfig };
