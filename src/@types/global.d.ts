declare module "*.jsx" {
    import { ComponentType } from "react";
    const Component: ComponentType;
    export default Component;
}

// 基础CSS文件支持
declare module '*.css' {
    const css: { [key: string]: string };
    export default css;
}

// 如果使用CSS Modules
declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}