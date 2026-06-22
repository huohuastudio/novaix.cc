# novaix.cc

[Novaix](https://novaix.cc) 官方网站源码。

## 技术栈

- [Astro](https://astro.build) — 静态站点生成
- [Tailwind CSS](https://tailwindcss.com) v4 — 样式
- [GitHub Pages](https://pages.github.com) — 托管与部署

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

## 构建

```bash
pnpm build      # 输出到 dist/
pnpm preview    # 本地预览构建产物
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

## License

Copyright &copy; [Spark Studio](https://huohuastudio.com). All rights reserved.
