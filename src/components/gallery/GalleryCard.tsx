import React from "react";
import {
  User,
  Clock,
  Database,
  Upload,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Download,
} from "lucide-react";
import type { GalleryItem } from "../../types";
import { StatusBadge } from "../ui/StatusBadge";

export const GalleryCard: React.FC<{ item: GalleryItem }> = ({ item }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row transition-all hover:shadow-md">
      {/* 封面部分 */}
      <div className="w-full md:w-32 h-48 md:h-auto bg-gray-200 flex-shrink-0 relative">
        <img
          src={item.cover}
          alt="cover"
          className="w-full h-full object-cover"
        />
        <StatusBadge status={item.status} />
      </div>

      {/* 内容部分 */}
      <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
        <div>
          <h3
            className="text-lg font-bold text-gray-900 truncate pr-4 mb-2"
            title={item.title}
          >
            {item.title || item.g}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600 mt-2">
            <div className="flex items-center space-x-1">
              <User size={14} className="text-gray-400" />
              <span className="font-medium text-gray-800 truncate">
                提交: {item.submitter_id} ({item.submitter_balance} GP)
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <Clock size={14} /> <span>{item.submit_time}</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold text-indigo-600">
              <Database size={14} /> <span>预期: {item.estimated_cost} GP</span>
            </div>
            {item.uploader_id && (
              <div className="flex items-center space-x-1">
                <Upload size={14} className="text-gray-400" />
                <span className="font-medium text-gray-800 truncate">
                  上传: {item.uploader_id} ({item.uploader_balance} GP)
                </span>
              </div>
            )}
          </div>

          {/* 消息展示逻辑 */}
          {(item.submitter_message || item.upload_message) && (
            <div className="mt-3 space-y-2">
              {item.submitter_message && (
                <MessageBubble type="submitter" text={item.submitter_message} />
              )}
              {item.upload_message && (
                <MessageBubble type="uploader" text={item.upload_message} />
              )}
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <VoteButton
              icon={<ThumbsUp size={16} />}
              count={item.sub_likes}
              hoverColor="hover:text-green-600"
            />
            <VoteButton
              icon={<ThumbsDown size={16} />}
              count={item.sub_dislikes}
              hoverColor="hover:text-red-600"
            />
          </div>
          <div className="flex space-x-2">
            <a
              href={item.g}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ExternalLink size={18} />
            </a>
            {item.download_url && (
              <button
                onClick={() => window.open(item.download_url, "_blank")}
                className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Download size={16} /> <span>下载资源</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 内部小组件
const MessageBubble = ({
  text,
  type,
}: {
  text: string;
  type: "submitter" | "uploader";
}) => (
  <div
    className={`p-2 rounded border-l-2 text-xs flex items-start space-x-2 ${type === "submitter" ? "bg-blue-50 border-blue-400 text-blue-800" : "bg-indigo-50 border-indigo-400 text-indigo-800"}`}
  >
    <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
    <span>
      <strong className="mr-1">
        {type === "submitter" ? "留言:" : "上传说明:"}
      </strong>
      {text}
    </span>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VoteButton = ({ icon, count, hoverColor }: any) => (
  <div
    className={`flex items-center space-x-1 text-gray-500 cursor-pointer transition-colors ${hoverColor}`}
  >
    {icon} <span className="text-xs font-bold">{count || 0}</span>
  </div>
);
