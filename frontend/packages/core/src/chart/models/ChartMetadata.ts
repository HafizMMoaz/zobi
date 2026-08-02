import { Behavior, ChartLabel } from '../types/Base';
import { ParseMethod } from '../../connection';

interface LookupTable {
  [key: string]: boolean;
}

export interface ExampleImage {
  url: string;
  urlDark?: string;
  caption?: string;
}

export interface ChartMetadataConfig {
  name: string;
  canBeAnnotationTypes?: string[];
  credits?: string[];
  description?: string;
  datasourceCount?: number;
  enableNoResults?: boolean;
  supportedAnnotationTypes?: string[];
  thumbnail: string;
  thumbnailDark?: string;
  useLegacyApi?: boolean;
  behaviors?: Behavior[];
  exampleGallery?: ExampleImage[];
  tags?: string[];
  category?: string | null;
  // deprecated: true hides a chart from all viz picker interactions.
  deprecated?: boolean;
  // label: ChartLabel.DEPRECATED which will display a "deprecated" label on the chart.
  label?: ChartLabel | null;
  labelExplanation?: string | null;
  queryObjectCount?: number;
  dynamicQueryObjectCount?: boolean;
  parseMethod?: ParseMethod;
  // suppressContextMenu: true hides the default context menu for the chart.
  // This is useful for viz plugins that define their own context menu.
  suppressContextMenu?: boolean;
}

export default class ChartMetadata {
  name: string;

  canBeAnnotationTypes?: string[];

  canBeAnnotationTypesLookup: LookupTable;

  credits: string[];

  description: string;

  supportedAnnotationTypes: string[];

  thumbnail: string;

  thumbnailDark?: string;

  useLegacyApi: boolean;

  behaviors: Behavior[];

  datasourceCount: number;

  enableNoResults: boolean;

  exampleGallery: ExampleImage[];

  tags: string[];

  category: string | null;

  deprecated?: boolean;

  label?: ChartLabel | null;

  labelExplanation?: string | null;

  queryObjectCount: number;

  dynamicQueryObjectCount: boolean;

  parseMethod: ParseMethod;

  suppressContextMenu?: boolean;

  constructor(config: ChartMetadataConfig) {
    const {
      name,
      canBeAnnotationTypes = [],
      credits = [],
      description = '',
      supportedAnnotationTypes = [],
      thumbnail,
      thumbnailDark,
      useLegacyApi = false,
      behaviors = [],
      datasourceCount = 1,
      enableNoResults = true,
      exampleGallery = [],
      tags = [],
      category = null,
      deprecated = false,
      label = null,
      labelExplanation = null,
      queryObjectCount = 1,
      dynamicQueryObjectCount = false,
      parseMethod = 'json-bigint',
      suppressContextMenu = false,
    } = config;

    this.name = name;
    this.credits = credits;
    this.description = description;
    this.canBeAnnotationTypes = canBeAnnotationTypes;
    this.canBeAnnotationTypesLookup = canBeAnnotationTypes.reduce(
      (prev: LookupTable, type: string) => {
        const lookup = prev;
        lookup[type] = true;

        return lookup;
      },
      {},
    );
    this.supportedAnnotationTypes = supportedAnnotationTypes;
    this.thumbnail = thumbnail;
    this.thumbnailDark = thumbnailDark;
    this.useLegacyApi = useLegacyApi;
    this.behaviors = behaviors;
    this.datasourceCount = datasourceCount;
    this.enableNoResults = enableNoResults;
    this.exampleGallery = exampleGallery;
    this.tags = tags;
    this.category = category;
    this.deprecated = deprecated;
    this.label = label;
    this.labelExplanation = labelExplanation;
    this.queryObjectCount = queryObjectCount;
    this.dynamicQueryObjectCount = dynamicQueryObjectCount;
    this.parseMethod = parseMethod;
    this.suppressContextMenu = suppressContextMenu;
  }

  canBeAnnotationType(type: string): boolean {
    return this.canBeAnnotationTypesLookup[type] || false;
  }

  clone() {
    return new ChartMetadata(this);
  }
}
