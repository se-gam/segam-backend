export type GodokStatus = {
  status: boolean;
  categoryStatus: {
    categoryCode: number;
    categoryName: string;
    categoryStatus: boolean;
    count: number;
    targetCount: number;
  }[];
};

export type GodokCategoryStatus = {
  categoryCode: number;
  categoryName: string;
  categoryStatus: boolean;
  count: number;
  targetCount: number;
};
