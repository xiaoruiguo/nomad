# Ember.js 中使用 Tailwind CSS 完整指南

## 概述

Tailwind CSS 是一个功能类优先的 CSS 框架，允许开发者通过预定义的原子类快速构建样式。本文档详细介绍在 Ember.js 项目中集成 Tailwind CSS 的方法，涵盖 Tailwind v3 和 v4 两个主要版本的集成方案。

---

## 一、Tailwind CSS 版本对比

| 特性 | Tailwind v3 | Tailwind v4 |
|-----|-------------|-------------|
| **配置方式** | `tailwind.config.js` + `postcss.config.js` | CSS 内 `@theme` 配置，无需 JS 配置文件 |
| **入口指令** | `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| **PostCSS 依赖** | 需要 `postcss.config.js` | 使用 Oxide 引擎，可选 PostCSS |
| **内容扫描** | 需在 `content` 字段配置路径 | 自动扫描，可用 `@source` 扩展 |
| **主题定制** | `tailwind.config.js` 的 `theme.extend` | CSS 内 `@theme` 块定义 |
| **引擎** | JavaScript | Rust（Oxide） |

---

## 二、Tailwind v3 集成方案（经典方案）

### 2.1 适用场景

- 现有 Ember 项目使用传统 Broccoli 构建管道
- 需要与现有 SCSS/Sass 共存
- 对稳定性要求较高的项目

### 2.2 安装步骤

#### 第一步：安装依赖

```bash
# 使用 npm
npm install -D tailwindcss postcss postcss-loader autoprefixer

# 或使用 pnpm（Nomad UI 使用 pnpm）
pnpm add -D tailwindcss postcss postcss-loader autoprefixer

# 初始化配置文件
npx tailwindcss init -p
```

这会生成两个文件：
- `tailwind.config.js` - Tailwind 配置
- `postcss.config.js` - PostCSS 配置

#### 第二步：配置 Ember CLI 构建

修改 [ember-cli-build.mjs](file:///D:/claude/nomad/ui/ember-cli-build.mjs)：

```javascript
'use strict';

import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';

export default function (defaults) {
  const app = new EmberApp(defaults, {
    // 现有配置保持不变...
    sassOptions: {
      precision: 4,
      includePaths: [
        './node_modules/bulma',
        // ...其他路径
      ],
    },
  });

  // 如果使用 Embroider
  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: [
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      config: 'postcss.config.js',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    },
  });

  // 如果不使用 Embroider（传统 Broccoli）
  // return app.toTree();
}
```

#### 第三步：配置 Tailwind

修改 `tailwind.config.js`：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{gjs,gts,hbs,html,js,ts}',
    './tests/**/*.{gjs,gts,hbs,html,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // 自定义颜色，可与现有 SCSS 变量对应
        nomad: {
          primary: '#0046d6',
          success: '#00bc8c',
          warning: '#ffd460',
          danger: '#db4d49',
        },
      },
    },
  },
  plugins: [],
};
```

#### 第四步：配置 PostCSS

修改 `postcss.config.js`：

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### 第五步：添加 Tailwind 指令到 CSS

创建 `app/styles/tailwind.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 第六步：导入 CSS 文件

修改 [app.ts](file:///D:/claude/nomad/ui/app/app.ts)：

```javascript
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'nomad-ui/config/environment';
import 'nomad-ui/app.css';  // 添加 Tailwind CSS 导入

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
```

### 2.3 在模板中使用

```handlebars
{{! app/templates/application.hbs }}
{{page-title "MyApp"}}

<div class="min-h-screen bg-gray-100">
  <h1 class="text-3xl font-bold text-nomad-primary">
    Hello Tailwind!
  </h1>

  <button class="px-4 py-2 bg-nomad-primary text-white rounded-lg hover:bg-blue-700">
    Click me
  </button>
</div>

{{outlet}}
```

---

## 三、Tailwind v4 集成方案（最新方案）

### 3.1 适用场景

- 新建 Ember 项目
- 追求更快的构建速度
- 希望使用 CSS 原生配置而非 JavaScript 配置

### 3.2 关键变化

Tailwind v4 的核心变化：

1. **移除 `@tailwindcss/postcss` 包**：使用 Oxide 引擎直接处理
2. **入口指令变更**：使用 `@import "tailwindcss"` 替代三个 `@tailwind` 指令
3. **配置文件可选**：主题配置直接在 CSS 中通过 `@theme` 完成
4. **自动内容扫描**：无需手动配置 `content` 路径

### 3.3 安装步骤

#### 第一步：安装依赖

```bash
# 使用 npm
npm install tailwindcss @tailwindcss/postcss postcss postcss-loader

# 或使用 pnpm
pnpm add -D tailwindcss @tailwindcss/postcss postcss postcss-loader
```

#### 第二步：配置 Ember CLI 构建

修改 [ember-cli-build.mjs](file:///D:/claude/nomad/ui/ember-cli-build.mjs)：

```javascript
'use strict';

import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';

export default function (defaults) {
  const app = new EmberApp(defaults, {
    // 现有配置保持不变...
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: ['postcss-loader'],
            },
          ],
        },
      },
    },
  });
}
```

#### 第三步：配置 PostCSS

创建 `postcss.config.mjs`：

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

#### 第四步：创建 CSS 入口文件

创建 `app/app.css`：

```css
@import "tailwindcss";

/* 使用 @theme 定义自定义主题 */
@theme {
  --color-nomad-primary: #0046d6;
  --color-nomad-success: #00bc8c;
  --color-nomad-warning: #ffd460;
  --color-nomad-danger: #db4d49;
}
```

#### 第五步：导入 CSS 文件

修改 [app.ts](file:///D:/claude/nomad/ui/app/app.ts)：

```javascript
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'nomad-ui/config/environment';
import 'nomad-ui/app.css';  // 导入 Tailwind CSS

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
```

---

## 四、与现有 SCSS 共存方案

Nomad UI 使用 SCSS 作为主要样式方案（见 [app.scss](file:///D:/claude/nomad/ui/app/styles/app.scss)）。Tailwind 可以与现有 SCSS 共存。

### 4.1 方案一：Tailwind 作为独立层

```
app/
├── styles/
│   ├── app.scss          # 现有 SCSS 入口
│   ├── core/             # 现有核心样式
│   └── components/       # 现有组件样式
├── app.css               # Tailwind CSS 入口
└── app.ts                # 同时导入两者
```

在 [app.ts](file:///D:/claude/nomad/ui/app/app.ts) 中：

```javascript
import 'nomad-ui/app.css';        // Tailwind CSS
// app.scss 仍由 ember-cli-sass 自动处理
```

### 4.2 方案二：Tailwind 集成到 SCSS

在 [app.scss](file:///D:/claude/nomad/ui/app/styles/app.scss) 中添加 Tailwind 导入：

```scss
// Tailwind v3 方式（注意：需要使用 @import 而非 @use）
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

// 现有 SCSS 导入
@use "ember-basic-dropdown.css";
@use "ember-power-select.css";
@import "./core";
@import "./components";
@import "./charts";
```

**⚠️ 注意**：`@use` 和 `@import` 不能混用 Tailwind 指令。建议使用方案一。

### 4.3 方案三：渐进式迁移

逐步将组件从 SCSS 迁移到 Tailwind：

```handlebars
{{! 使用 Tailwind 类替代 SCSS 类 }}
<div class="bg-white rounded-lg shadow-md p-6 mb-4">
  <h2 class="text-xl font-bold text-gray-900 mb-2">Title</h2>
  <p class="text-gray-600">Content</p>
</div>
```

---

## 五、ember-cli-tailwind 插件方案

### 5.1 简介

`ember-cli-tailwind` 是一个社区插件，简化 Tailwind 与 Ember 的集成。

### 5.2 安装

```bash
ember install ember-cli-tailwind
```

### 5.3 配置

安装后，插件会自动：
- 在 `app/tailwind/` 目录生成配置文件
- 提供风格指南页面（开发环境访问 `/tailwind`）

### 5.4 使用

```scss
// 在 SCSS 中导入
@import 'tailwind';
```

---

## 六、Glimmer 组件中使用 Tailwind

### 6.1 基本使用

```javascript
// app/components/my-button.gjs
import Component from '@glimmer/component';

export default class MyButton extends Component {
  get buttonClasses() {
    let base = 'px-4 py-2 rounded-lg font-medium transition-colors';
    if (this.args.variant === 'primary') {
      return `${base} bg-blue-600 text-white hover:bg-blue-700`;
    }
    return `${base} bg-gray-200 text-gray-800 hover:bg-gray-300`;
  }
}
```

```handlebars
{{! 模板部分 }}
<button class={{this.buttonClasses}} ...attributes>
  {{yield}}
</button>
```

### 6.2 使用 `@apply` 组合样式

在 CSS 文件中：

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  }

  .card {
    @apply bg-white rounded-xl shadow-md p-6 border border-gray-200;
  }

  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

在模板中：

```handlebars
<div class="card">
  <button class="btn-primary">Submit</button>
  <input class="input-field" type="text" />
</div>
```

---

## 七、响应式设计

### 7.1 断点

Tailwind 默认断点：

| 断点 | 宽度 | 说明 |
|-----|------|------|
| `sm` | 640px | 小屏幕 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 桌面 |
| `xl` | 1280px | 大屏桌面 |
| `2xl` | 1536px | 超大屏 |

### 7.2 在 Ember 模板中使用

```handlebars
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {{#each this.items as |item|}}
    <div class="bg-white p-4 rounded-lg shadow">
      {{item.name}}
    </div>
  {{/each}}
</div>
```

### 7.3 与 ember-responsive 集成

Nomad UI 已使用 `ember-responsive` 进行媒体查询。可以结合使用：

```javascript
import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class ResponsiveComponent extends Component {
  @service media;

  get containerClass() {
    if (this.media.isMobile) {
      return 'flex flex-col space-y-2';
    }
    return 'flex flex-row space-x-2';
  }
}
```

---

## 八、与 HashiCorp 设计系统共存

Nomad UI 使用 `@hashicorp/design-system-components`。Tailwind 可以与之共存：

### 8.1 使用 Tailwind 进行布局

```handlebars
<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">Title</h1>
  <Hds::Button @text="Action" @color="primary" />
</div>
```

### 8.2 使用 Tailwind 间距工具类

```handlebars
<div class="space-y-4">
  <Hds::Alert @type="inline" @color="warning" as |A|>
    <A.Title>Warning</A.Title>
    <A.Description>This is a warning</A.Description>
  </Hds::Alert>

  <div class="mt-4 p-4 bg-gray-50 rounded-lg">
    Content
  </div>
</div>
```

---

## 九、常见问题

### 问题 1：样式不生效

**原因**：`content` 配置路径不正确。

**解决**：确保 `tailwind.config.js` 包含所有模板文件路径：

```javascript
content: [
  './app/**/*.{gjs,gts,hbs,html,js,ts}',
  './tests/**/*.{gjs,gts,hbs,html,js,ts}',
  './node_modules/@hashicorp/design-system-components/**/*.{js,hbs}',
],
```

### 问题 2：与 SCSS 样式冲突

**原因**：Tailwind 的 `base` 层重置了默认样式。

**解决**：禁用 Tailwind 的 preflight：

```javascript
// tailwind.config.js (v3)
module.exports = {
  corePlugins: {
    preflight: false,  // 禁用 CSS reset
  },
  // ...
};
```

### 问题 3：v4 中 `@tailwind` 指令无效

**原因**：Tailwind v4 使用 `@import "tailwindcss"` 作为入口。

**解决**：

```css
/* ❌ v3 写法 - 在 v4 中无效 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ v4 写法 */
@import "tailwindcss";
```

### 问题 4：生产环境样式被错误清除

**原因**：Tailwind 的 purge 机制过于激进。

**解决**：添加 safelist：

```javascript
// tailwind.config.js (v3)
module.exports = {
  content: [...],
  safelist: [
    'bg-red-500',
    'text-white',
    { pattern: /bg-(red|green|blue)-(500|600)/ },
  ],
  // ...
};
```

---

## 十、性能优化

### 10.1 生产环境构建

Tailwind 会自动移除未使用的 CSS：

```bash
# 生产构建
EMBER_ENV=production ember build --environment=production
```

### 10.2 按需加载组件样式

```javascript
// 使用动态导入
import Component from '@glimmer/component';

export default class LazyComponent extends Component {
  // 按需导入样式
  async loadStyles() {
    await import('./lazy-styles.css');
  }
}
```

---

## 十一、完整集成示例

### 11.1 项目结构

```
ui/
├── app/
│   ├── app.ts              # 应用入口
│   ├── app.css             # Tailwind CSS 入口
│   ├── styles/
│   │   ├── app.scss        # 现有 SCSS 入口
│   │   ├── core/           # 核心样式
│   │   └── components/     # 组件样式
│   └── components/
│       └── tailwind-card.gjs  # 使用 Tailwind 的组件
├── tailwind.config.js      # Tailwind 配置（v3）
├── postcss.config.js       # PostCSS 配置
└── ember-cli-build.mjs     # Ember CLI 构建配置
```

### 11.2 示例组件

```javascript
// app/components/tailwind-card.gjs
import Component from '@glimmer/component';

export default class TailwindCard extends Component {
  get cardClasses() {
    return [
      'bg-white',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'border',
      'border-gray-200',
      'hover:shadow-lg',
      'transition-shadow',
    ].join(' ');
  }
}
```

```handlebars
{{! 模板 }}
<div class={{this.cardClasses}} ...attributes>
  {{#if @title}}
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      {{@title}}
    </h3>
  {{/if}}
  <div class="text-gray-600">
    {{yield}}
  </div>
</div>
```

### 11.3 使用示例

```handlebars
<TailwindCard @title="Job Status">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-500">Running</span>
    <span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
      Active
    </span>
  </div>
</TailwindCard>
```

---

## 十二、Nomad UI 集成建议

### 12.1 推荐方案

对于 Nomad UI 项目，推荐使用 **方案一：Tailwind v3 + 独立 CSS 文件**：

1. **保持现有 SCSS 不变**：不破坏现有样式系统
2. **新增 Tailwind CSS 文件**：新组件使用 Tailwind
3. **渐进式迁移**：逐步将旧组件迁移到 Tailwind

### 12.2 具体步骤

```bash
# 1. 安装依赖
cd ui
pnpm add -D tailwindcss postcss postcss-loader autoprefixer

# 2. 初始化配置
npx tailwindcss init -p

# 3. 修改配置文件
# - 修改 ember-cli-build.mjs 添加 PostCSS 支持
# - 修改 tailwind.config.js 配置内容路径
# - 创建 app/app.css 添加 Tailwind 指令
# - 修改 app/app.ts 导入 CSS
```

### 12.3 配置建议

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{gjs,gts,hbs,html,js,ts}',
    './tests/**/*.{gjs,gts,hbs,html,js,ts}',
    './node_modules/@hashicorp/design-system-components/**/*.{js,hbs}',
  ],
  // 禁用 preflight 避免与 Bulma 冲突
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        nomad: {
          primary: '#0046d6',
          success: '#00bc8c',
          warning: '#ffd460',
          danger: '#db4d49',
        },
      },
    },
  },
  plugins: [],
};
```

---

## 十三、源码文件索引

| 文件 | 说明 |
|-----|------|
| [ui/ember-cli-build.mjs](file:///D:/claude/nomad/ui/ember-cli-build.mjs) | Ember CLI 构建配置 |
| [ui/app/app.ts](file:///D:/claude/nomad/ui/app/app.ts) | 应用入口文件 |
| [ui/app/styles/app.scss](file:///D:/claude/nomad/ui/app/styles/app.scss) | SCSS 样式入口 |
| [ui/package.json](file:///D:/claude/nomad/ui/package.json) | 项目依赖配置 |
| [ui/config/environment.js](file:///D:/claude/nomad/ui/config/environment.js) | 环境配置 |

---

## 附录：参考资源

- [Tailwind CSS 官方 Ember.js 集成指南](https://tailwindcss.com/docs/guides/emberjs)
- [Tailwind CSS v4 迁移指南](https://tailwindcss.com/docs/upgrade-guide)
- [ember-cli-tailwind 插件](https://github.com/embermap/ember-cli-tailwind)
- [Embroider 文档](https://github.com/embroider-build/embroider)
