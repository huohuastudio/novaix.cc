// 后台侧边栏菜单（与 ui/src/lib/nav.ts 一致，摘自实际渲染结果）
export interface NavGroup {
  label?: string;
  items: { title: string; icon: string }[];
}

export const navGroups: NavGroup[] = [
  { items: [{ title: "仪表盘", icon: "layout-dashboard" }] },
  {
    label: "资源管理",
    items: [
      { title: "区域管理", icon: "map-pin" },
      { title: "节点管理", icon: "server" },
      { title: "实例管理", icon: "monitor-cog" },
      { title: "镜像管理", icon: "disc3" },
      { title: "ISO 镜像", icon: "disc" },
    ],
  },
  {
    label: "网络",
    items: [
      { title: "IP 池管理", icon: "network" },
      { title: "共享 IP", icon: "globe" },
      { title: "私有网络", icon: "shield" },
    ],
  },
  {
    label: "供应商",
    items: [
      { title: "供应商连接", icon: "cable" },
      { title: "模块商品", icon: "package-open" },
      { title: "服务管理", icon: "boxes" },
      { title: "待处理", icon: "clipboard-list" },
    ],
  },
  {
    label: "用户",
    items: [
      { title: "用户管理", icon: "users" },
      { title: "代理管理", icon: "user-check" },
      { title: "工单系统", icon: "message-square-text" },
    ],
  },
  {
    label: "商品",
    items: [
      { title: "套餐管理", icon: "package" },
      { title: "流量包", icon: "gauge" },
      { title: "优惠券", icon: "ticket" },
    ],
  },
  {
    label: "财务",
    items: [
      { title: "订单管理", icon: "shopping-cart" },
      { title: "支付记录", icon: "credit-card" },
      { title: "发票管理", icon: "receipt" },
      { title: "转移管理", icon: "arrow-left-right" },
    ],
  },
  {
    label: "站点",
    items: [
      { title: "内容管理", icon: "square-pen" },
      { title: "主题", icon: "palette" },
    ],
  },
  {
    label: "系统",
    items: [
      { title: "插件", icon: "blocks" },
      { title: "集成方", icon: "plug" },
      { title: "任务管理", icon: "list-checks" },
      { title: "告警记录", icon: "bell" },
      { title: "操作日志", icon: "scroll-text" },
      { title: "系统设置", icon: "settings2" },
      { title: "关于", icon: "info" },
    ],
  },
];
