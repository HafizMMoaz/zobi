import { useEffect, useState } from 'react';
import { ZobiClient } from '@zobi.dev/core';
import rison from 'rison';
import { LayerInfo } from './types';

interface SliceResponse {
  id: number;
  slice_name: string;
  viz_type: string;
}

export const useDeckLayerMetadata = (
  sliceIds: number[],
): {
  layers: LayerInfo[];
  isLoading: boolean;
  error: string | null;
} => {
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(sliceIds.length > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sliceIds || sliceIds.length === 0) {
      setLayers([]);
      setIsLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = rison.encode({
          columns: ['id', 'slice_name', 'viz_type'],
          filters: [{ col: 'id', opr: 'in', value: sliceIds }],
        });
        const endpoint = `/api/v1/chart/?q=${queryParams}`;

        const response = await ZobiClient.get({ endpoint });

        const slices: SliceResponse[] = response.json.result || [];

        const layerInfos: LayerInfo[] = slices.map(slice => ({
          sliceId: slice.id,
          name: slice.slice_name,
          type: slice.viz_type,
        }));

        setLayers(layerInfos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');

        const fallbackLayers = sliceIds.map(id => ({
          sliceId: id,
          name: `Layer ${id}`,
          type: 'unknown',
        }));
        setLayers(fallbackLayers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [sliceIds.join(',')]);

  return { layers, isLoading, error };
};
