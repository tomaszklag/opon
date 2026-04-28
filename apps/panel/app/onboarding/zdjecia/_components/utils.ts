import type { PhotoType } from '../../../../lib/hooks/use-photos-flow';

export interface RequiredTileDef {
  type: PhotoType;
  title: string;
  sub: string;
  index: string;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
