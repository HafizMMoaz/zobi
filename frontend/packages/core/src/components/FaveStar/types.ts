export interface FaveStarProps {
  itemId: number;
  isStarred?: boolean;
  showTooltip?: boolean;
  saveFaveStar(id: number, isStarred: boolean): any;
  fetchFaveStar?: (id: number) => void;
}
