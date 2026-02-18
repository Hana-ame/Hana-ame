export type StatusType = "估计cost中" | "等待上传" | "已完成" | "已经关闭";

export interface GalleryItem {
  id: number;
  g: string; // "/g/:token/:id"

  // POST /submit
  title: string;
  cover: string;
  submitter_id: string;
  submitter_balance: number;
  submit_time: string;
  submitter_message?: string;

  // estimate cost
  estimated_cost: number; // Set by POST /:id/cost

  // upload
  uploader_id?: string;
  uploader_balance?: number;
  download_url?: string;
  upload_time?: string;
  upload_message?: string;

  // For Submitter (The Request itself)
  // These should be set by POST /:id/submission/vote
  sub_likes?: number;
  sub_dislikes?: number;

  // For Uploader (The Gallery content/result)
  // These should be set by POST /:id/gallery/vote
  g_likes?: number;
  g_dislikes?: number;

  status: StatusType;
}

export type TabType =
  | "recent_submit"
  | "recent_upload"
  | "related"
  | "settings";
