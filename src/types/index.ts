export type StatusType = "估计cost中" | "等待上传" | "已完成" | "已经关闭";

export interface GalleryItem {
  id: number; // the unique id for the item
  g: string; // "/g/:token/:id"
  // POST ENDPOINT/submit
  title: string;
  cover: string;
  submitter_id: string;
  submitter_balance: number;
  submit_time: string;
  submitter_message?: string;
  // 估计cost
  estimated_cost: number; // this should be set by POST ENDPOINT/:id/cost
  // upload
  uploader_id?: string;
  uploader_balance?: number;
  download_url?: string;
  upload_time?: string;
  upload_message?: string;
  //   for submitter
  sub_likes?: number; // this should be set by POST ENDPOINT/:id/[someword]
  sub_dislikes?: number; // this should be set by POST ENDPOINT/:id/[someword]
  //   for uploader
  g_likes?: number; // this should be set by POST ENDPOINT/:id/[someword]
  g_dislikes?: number; // this should be set by POST ENDPOINT/:id/[someword]
  //   the status of gallery item
  status: StatusType;
}

export type TabType =
  | "recent_submit"
  | "recent_upload"
  | "related"
  | "settings";
