# @gkd-kit/selector

一个类似 css 选择器的高级选择器

## 语法

与 css 类似, 一个选择器由 属性选择器 和 关系选择器 交叉组成, 并且开头末尾必须是 属性选择器

示例 `div > img` 的结构是 `属性选择器 关系选择器 属性选择器`, 它表示选择一个 `img` 节点并且它父节点是 `div`, 这与相同 css 语法语义一致

另外 属性选择器 和 关系选择器 之前必须强制用空格隔开, 也就是 `div>img` 是非法的, 必须写成 `div > img`

下面分别介绍 属性选择器 和 关系选择器

### 属性选择器

它和 css 语法的 属性选择器很相似, 但更强大, 如下是一个示例

`@TextView[a=1][b^='2'][c*='a'||d.length>7&&e=false]`

`@` 表示选择此节点, 一条规则最后属性选择器 `@` 生效, 如果没有 `@`, 取最后一个属性选择器

`name` 代表节点的 name 属性, 与 css 相似, `*` 表示匹配任意属性

由于该选择器主要用于 Android 平台, 节点的 name 都是 java 类如 android.text.TextView 这种形式

为了方便书写规则, `TextView` 等价 `[name='TextView'||name$='.TextView']`

`[]` 内部是一个 逻辑表达式/布尔表达式

逻辑表达式 有操作符 || && 语义及其优先级都与 js 的一致

布尔表达式 由 属性名 操作符 值 构成

属性名: 正则匹配 `^[_a-zA-Z][a-zA-Z0-9_]*(\.[_a-zA-Z][a-zA-Z0-9_]*)*$` 的字符串, 它类似变量名 `a`/`a.length`
操作符: `=`,`!=`,`>`,`<`,`>=`,`<=`,`^=`,`!^=`,`*=`,`!*=`,`$=`,`!$=`, 它们的语义和 css 一样, `!` 是取反, 比如 `a!$='1'` 表示 属性 a 不以 `'1'` 结尾
值: 4 种类型, `null`, `true/false`, string, int. 其中 int 匹配 `[0-9]`, string 可以使用 ' &#96; " 包裹, 内部转义使用 \, 但仅支持 \ &#96; \' \" 转义

操作符只能使用在对应的类型, 比如 `a>''` 类型不匹配, 因此它永远是 false

### 关系选择器

用于连接两个属性选择器, 示例: `div > a`, 它表示两个节点之间的关系

有 4 种关系操作符, `A +-><(an+b) B`, 这里 an+b 的规则类似 css 的 :n-th(an+b) 选择语法, 并且 a 和 b 都是常量, 选择器会从 n=1,2,3 开始查找, 并且当 an+b<=0 时停止查找

`A +(an+b) B` : A 是 B 的前置兄弟节点, 并且 A.index 满足 B.index-(an+b)

`A -(an+b) B` : A 是 B 的后置兄弟节点, 并且 A.index 满足 B.index+(an+b)

`A >(an+b) B` : A 是 B 的祖先节点, 并且 A.depth 满足 B.depth-(an+b), 根节点的 depth=0

`A <(an+b) B` : A 是 B 的直接子节点, 并且 A.index 满足 an+b-1

当 a=0 且 b<=0 时, 选择器非法, 即 `A +(-3) B`,`A -(-3) B`,`A >(-3) B`,`A <(-3) B`, 非法

当 a=0 或 b=0 时, 括号可以省略, 比如 `A +(3n+0) B` -> `A +(3n) B` -> `A +3n B`, `A +(0n+3) B` -> `A +(+3) B` -> `A +3 B`

当 a=0 且 b=1 时, an+b 可以省略, 比如 `A <(0n+1) B` -> `A < B`, 此外 `A + B`,`A > B` 都与等价的 css 语法语义相同

当 a=1 且 b=0 且操作符是 `>`, 可以进一步简写, 比如 `A >(1n+0) B` -> `A >n B` -> `A B`, 这与等价的 css 语法语义相同

## 示例

```txt
@LinearLayout > TextView[id=`com.byted.pangle:id/tt_item_tv`][text=`不感兴趣`]
```

首先找到 id=&#96;com.byted.pangle:id/tt_item_tv&#96; 和 text=&#96;不感兴趣&#96; 的 TextView, 并且父节点是 LinearLayout 的节点

此时我们得到两个节点 [LinearLayout, TextView] 根据 `@` 知道目标节点是 LinearLayout

实际上它与

```txt
TextView[id=`com.byted.pangle:id/tt_item_tv`][text=`不感兴趣`] <n LinearLayout
```

的目标匹配节点是等价的, 但是在查询算法时间复杂度上, 后者更慢

<https://gkd-kit.gitee.io/import/38517192/7d8e9661-c29a-4448-94c2-d7b0a1756107>
