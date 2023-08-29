# @gkd-kit/selector

一个类似 css 选择器的更强大的树节点选择器

## 语法

与 css 类似, 一个选择器由 属性选择器 和 关系选择器 交叉组成, 并且开头末尾必须是 属性选择器

示例 `div > img` 表示选择一个 `img` 节点并且它父节点是 `div`, 这与相同 css 语法语义一致

### 属性选择器

它和 css 语法的 属性选择器很相似, 但更强大, 如下是一个示例

`@name[a=1][b^='2'][c*='a'||d.length>7&&e=false]`

`@` 表示选择此节点, 一条规则最后属性选择器 `@` 生效, 如果没有 `@`, 取最后一个属性选择器

`name` 代表节点的 name 属性, 与 css 相似, `*` 表示匹配任意节点

由于该选择器主要用于 Android 平台, 节点的 name 都是 java 类如 android.text.TextView 这种形式

为了方便书写, `TextView` 可以简单等价 `[name='TextView'||name$='.TextView']`

`[]` 内部是一个 LogicalExpression/BinaryExpression

LogicalExpression 有操作符 || && 语义及其优先级都与 js 的一致

BinaryExpression 由 属性名 操作符 值 构成

属性名: 正则匹配 `^[_a-zA-Z][a-zA-Z0-9_]*(\.[_a-zA-Z][a-zA-Z0-9_]*)*$` 的字符串
操作符: `=`,`!=`,`>`,`<`,`>=`,`<=`,`^=`,`!^=`,`*=`,`!*=`,`$=`,`!$=`
值: 4 种类型, `null`, `true/false`, string, int. 其中 int 匹配 `[0-9]`, string 可以使用 ' &#96; " 包裹, 内部转义使用 \, 但仅支持 \ &#96; \' \" 转义

可以看出 string 的规则符合 js 的规范

### 关系选择器

用于连接两个属性选择器, 示例: `div > a`, 属性选择器与关系选择器之间至少一个空格

有 4 种关系操作符, `A +-><(an+b) B`, 这里 an+b 的规则类似 css 的 :n-th(an+b) 选择语法, an+b<=0 时停止查找

`A +(an+b) B` : A 是 B 的兄弟节点, 并且 A_index 满足 B_index-(an+b)

`A -(an+b) B` : A 是 B 的兄弟节点, 并且 A_index 满足 B_index+(an+b)

`A >(an+b) B` : A 是 B 的祖先节点, 并且 A_depth 满足 B_depth-(an+b)

`A <(an+b) B` : A 是 B 的直接子节点, 并且 A_index 满足 an+b-1

当 a=0 或 b=0 时, 括号可以省略, 比如 `A +(3n+0) B` -> `A +(3n) B` -> `A +3n B`

当 a=0 且 b=1 时, an+b 可以省略, 比如 `A <(0n+1) B` -> `A < B`, 此外 `A + B`,`A > B` 都与等价的 css 语法语义相同

当 a=1 且 b=0 且操作符是 `>`, 可以进一步简写, 比如 `A >(1n+0) B` -> `A >n B` -> `A B`, 这与等价的 css 语法语义相同

## 安装

```shell
pnpm add @gkd-kit/selector
```

## 示例

```txt
@LinearLayout > TextView[id=`com.byted.pangle:id/tt_item_tv`][text=`不感兴趣`]
```

首先找到 id=&#96;com.byted.pangle:id/tt_item_tv&#96; 和 text=&#96;不感兴趣&#96; 的 TextView, 并且父节点是 LinearLayout 的节点

此时我们得到两个节点 [LinearLayout, TextView] 根据 `@` 我们想匹配是节点是 LinearLayout

实际上它与

```txt
TextView[id=`com.byted.pangle:id/tt_item_tv`][text=`不感兴趣`] <n LinearLayout
```

的匹配节点是等价的, 但是在查询算法时间复杂度上, 后者更慢

## 使用

```ts
import SelectorKit from '@gkd-kit/selector';
const { CommonSelector, CommonTransform } = SelectorKit;
const transform = new CommonTransform<Element>(
  (node, name) => {
    return node.getAttribute(name);
  },
  (node) => node.tagName,
  (node) => Array.from(node.children),
  (node) => node.parentElement,
);
const selector = CommonSelector.Companion.parse(`@div < div[title!=null]`);
const querySelector = (node: Element): Element | null => {
  return transform.querySelector(node, selector) ?? null;
};
const div = querySelector(document.body);
console.log(div);
```
