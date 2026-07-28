declare module "react-icons/fi" {
  import { ComponentType, SVGAttributes } from "react";
  interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    title?: string;
  }
  type IconType = ComponentType<IconBaseProps>;
  export const FiActivity: IconType;
  export const FiAlertCircle: IconType;
  export const FiAlertTriangle: IconType;
  export const FiBookmark: IconType;
  export const FiChevronDown: IconType;
  export const FiChevronLeft: IconType;
  export const FiChevronRight: IconType;
  export const FiChevronUp: IconType;
  export const FiCheck: IconType;
  export const FiClock: IconType;
  export const FiCopy: IconType;
  export const FiCpu: IconType;
  export const FiDownload: IconType;
  export const FiEdit2: IconType;
  export const FiHash: IconType;
  export const FiInfo: IconType;
  export const FiPlus: IconType;
  export const FiSend: IconType;
  export const FiSettings: IconType;
  export const FiTrash2: IconType;
  export const FiUser: IconType;
  export const FiX: IconType;
}