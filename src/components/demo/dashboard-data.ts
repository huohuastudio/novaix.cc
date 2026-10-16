// 仪表盘演示数据：导出自本地演示环境的管理端仪表盘接口
// 时间字段均为相对值，渲染时按当前日期换算，避免数据看起来过期
// 金额单位为分，内存单位 MB，磁盘单位 GB
export const dashboard = {
  "nodes": {
    "total": 8,
    "online": 7,
    "offline": 0,
    "error": 0
  },
  "instances": {
    "total": 182,
    "running": 155,
    "stopped": 21,
    "error": 1,
    "creating": 2,
    "rescue": 0
  },
  "users": {
    "total": 136,
    "active": 131
  },
  "orders": {
    "total": 402,
    "pending": 2,
    "paid_total": 398,
    "revenue_today": 71500,
    "revenue_month": 1618100,
    "revenue_last_month": 1362300
  },
  "tickets": {
    "open": 4
  },
  "resources": {
    "cpu_total": 864,
    "cpu_used": 418,
    "mem_total": 1769472,
    "mem_used": 833536,
    "disk_total": 27840,
    "disk_used": 11660
  },
  "nodeRanking": [
    {
      "id": 1,
      "name": "hk-01",
      "cpu_usage": 73.4375,
      "mem_usage": 71.4844,
      "disk_usage": 66.1458
    },
    {
      "id": 2,
      "name": "hk-02",
      "cpu_usage": 82.8125,
      "mem_usage": 81.6406,
      "disk_usage": 77.6042
    },
    {
      "id": 3,
      "name": "tyo-01",
      "cpu_usage": 55.2083,
      "mem_usage": 54.6875,
      "disk_usage": 55.5556
    },
    {
      "id": 4,
      "name": "sg-01",
      "cpu_usage": 41.6667,
      "mem_usage": 38.5417,
      "disk_usage": 38.1944
    },
    {
      "id": 5,
      "name": "lax-01",
      "cpu_usage": 31.7708,
      "mem_usage": 30.7292,
      "disk_usage": 21.6146
    },
    {
      "id": 6,
      "name": "lax-02",
      "cpu_usage": 40.625,
      "mem_usage": 39.4531,
      "disk_usage": 36.4583
    },
    {
      "id": 7,
      "name": "fra-01",
      "cpu_usage": 12.5,
      "mem_usage": 12.5,
      "disk_usage": 13.1944
    }
  ],
  "regions": [
    {
      "region_id": 1,
      "display_name": "香港",
      "latitude": 22.32,
      "longitude": 114.17,
      "node_count": 2,
      "online_count": 2,
      "cpu_usage": 78.12,
      "mem_usage": 76.56,
      "disk_usage": 71.88
    },
    {
      "region_id": 2,
      "display_name": "东京",
      "latitude": 35.68,
      "longitude": 139.69,
      "node_count": 1,
      "online_count": 1,
      "cpu_usage": 55.21,
      "mem_usage": 54.69,
      "disk_usage": 55.56
    },
    {
      "region_id": 3,
      "display_name": "新加坡",
      "latitude": 1.35,
      "longitude": 103.82,
      "node_count": 1,
      "online_count": 1,
      "cpu_usage": 41.67,
      "mem_usage": 38.54,
      "disk_usage": 38.19
    },
    {
      "region_id": 4,
      "display_name": "洛杉矶",
      "latitude": 34.05,
      "longitude": -118.24,
      "node_count": 2,
      "online_count": 2,
      "cpu_usage": 35.31,
      "mem_usage": 34.22,
      "disk_usage": 26.56
    },
    {
      "region_id": 5,
      "display_name": "法兰克福",
      "latitude": 50.11,
      "longitude": 8.68,
      "node_count": 1,
      "online_count": 1,
      "cpu_usage": 12.5,
      "mem_usage": 12.5,
      "disk_usage": 13.19
    },
    {
      "region_id": 6,
      "display_name": "上海",
      "latitude": 31.23,
      "longitude": 121.47,
      "node_count": 1,
      "online_count": 0,
      "cpu_usage": 50,
      "mem_usage": 48.44,
      "disk_usage": 44.79
    }
  ],
  "revenueTrend": [
    41500,
    33500,
    55700,
    27500,
    34600,
    35500,
    94500,
    46300,
    31500,
    21700,
    21600,
    77300,
    44400,
    61300,
    102500,
    108500,
    73300,
    116200,
    97900,
    128800,
    83800,
    121700,
    74900,
    63300,
    115900,
    112600,
    98800,
    158600,
    89800,
    71500
  ],
  "recentOrders": [
    {
      "username": "chen_218",
      "type": "new",
      "amount": 9900,
      "status": "pending",
      "minutesAgo": 5
    },
    {
      "username": "lin482",
      "type": "renew",
      "amount": 5900,
      "status": "paid",
      "minutesAgo": 13
    },
    {
      "username": "wang_77",
      "type": "upgrade",
      "amount": 19900,
      "status": "paid",
      "minutesAgo": 28
    },
    {
      "username": "zhao391",
      "type": "new",
      "amount": 2900,
      "status": "cancelled",
      "minutesAgo": 43
    },
    {
      "username": "liu605",
      "type": "traffic_package",
      "amount": 1500,
      "status": "paid",
      "minutesAgo": 60
    },
    {
      "username": "yang_29",
      "type": "renew",
      "amount": 39900,
      "status": "refunded",
      "minutesAgo": 76
    },
    {
      "username": "huang812",
      "type": "new",
      "amount": 5900,
      "status": "pending",
      "minutesAgo": 97
    }
  ],
  "expiring": [
    {
      "name": "web-prod-01",
      "username": "luo552",
      "ip": "103.151.24.17",
      "daysLeft": 1
    },
    {
      "name": "db-replica",
      "username": "zhao_661",
      "ip": "103.155.88.140",
      "daysLeft": 3
    },
    {
      "name": "game-srv-hk",
      "username": "wang_980",
      "ip": "103.152.61.9",
      "daysLeft": 5
    }
  ],
  "events": [
    {
      "action": "instance.create",
      "detail": "创建实例 vps-1186（2 核 / 4 GB / 60 GB）",
      "username": "admin",
      "minutesAgo": 8
    },
    {
      "action": "order.pay",
      "detail": "订单 NX2026101609324 支付成功 ¥99.00",
      "username": "admin",
      "minutesAgo": 16
    },
    {
      "action": "node.update",
      "detail": "更新节点 lax-01 超售比例",
      "username": "admin",
      "minutesAgo": 39
    },
    {
      "action": "instance.reinstall",
      "detail": "重装实例 vps-1042 系统为 Debian 12",
      "username": "admin",
      "minutesAgo": 54
    },
    {
      "action": "user.adjust_balance",
      "detail": "调整用户 wang_77 余额 +¥200.00",
      "username": "admin",
      "minutesAgo": 90
    },
    {
      "action": "instance.delete",
      "detail": "删除已到期实例 vps-1009",
      "username": "admin",
      "minutesAgo": 132
    },
    {
      "action": "plan.create",
      "detail": "新建套餐「东京 CN2 · 入门」",
      "username": "admin",
      "minutesAgo": 212
    }
  ]
}
