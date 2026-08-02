import { QueryFormColumn, QueryFormData } from '@zobi.dev/core';
import { WordCloudVisualProps } from './chart/WordCloud';

// FormData for wordcloud contains both common properties of all form data
// and properties specific to wordcloud visualization
export type WordCloudFormData = QueryFormData &
  WordCloudVisualProps & {
    series: QueryFormColumn;
  };
