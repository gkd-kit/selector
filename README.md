# @gkd-kit/selector

一个类似 css 选择器的高级选择器

<details open>
  <summary>示例: 选择器路径视图</summary>

![image](https://github.com/gkd-kit/inspect/assets/38517192/27d0656a-2239-426c-930c-749ffb9f189b)

</details>

## 语法

与 css 类似, 一个选择器由 属性选择器 和 关系选择器 交叉组成, 并且开头末尾必须是 属性选择器

示例 `div > img` 的结构是 `属性选择器 关系选择器 属性选择器`, 它表示选择一个 `img` 节点并且它父节点是 `div`, 这与相同 css 语法语义一致

另外 属性选择器 和 关系选择器 之前必须强制用空格隔开, 也就是 `div>img` 是非法的, 必须写成 `div > img`

下面分别介绍 属性选择器 和 关系选择器

### 属性选择器

它和 css 语法的 属性选择器很相似, 但更强大, 如下是一个示例

`@TextView[a=1][b^='2'][c*='a'||d.length>7&&e=false]`

`@` 表示选择此节点, 一条规则最后属性选择器 `@` 生效, 如果没有 `@`, 取最后一个属性选择器

`TextView` 代表节点的 name 属性, 而且与 css 相似, `*` 表示匹配任意属性

由于该选择器主要用于 Android 平台, 节点的 name 都是 java 类如 android.text.TextView 这种形式

为了方便书写规则, `TextView` 等价 `[name='TextView'||name$='.TextView']`

`[]` 内部是一个 逻辑表达式/布尔表达式

逻辑表达式 有操作符 `||` 和 `&&`. 此外 `&&` 优先级更高, 即 `[a>1||b>1&&c>1||d>1]` 等价于 `[a>1||(b>1&&c>1)||d>1]`

布尔表达式 由 `属性名` `操作符` `值` 构成

属性名: 正则匹配 `^[_a-zA-Z][a-zA-Z0-9_]*(\.[_a-zA-Z][a-zA-Z0-9_]*)*$` 的字符串, 它类似变量名 `a`/`a.length`

操作符: `=`, `!=`, `>`, `<`, `>=`, `<=`, `^=`, `*=`, `$=`, `!^=`, `!*=`, `!$=`

`^=` -> `startsWith`

`*=` -> `contains`

`$=` -> `endsWith`

`!^=` -> `notStartsWith`

`!*=` -> `notContains`

`!$=` -> `notEndsWith`

值: 4 种类型, `null`, `boolean`, `string`, `int`

- null
- boolean 使用 `true`/`false`
- int 匹配 `[0-9]`, 仅支持 10 进制自然数
- string 使用 ' &#96; " 之一成对包裹, 内部字符转义使用 `\`\
    所有的转义字符示例 `\\`, `\'`, `\"`, `` \` ``, `\n`, `\r`, `\t`, `\b`, `\xFF`, `\uFFFF`\
    不支持多行字符, 处于 `[0, 0x1F]` 的控制字符必须使用转义字符表示

操作符只能使用在对应的类型, 比如 `a>''` 类型不匹配, 因此它永远是 false

下面表格中 `-` 表示类型不匹配

|      |   null   | boolean  |   int    |  string  |
| :--: | :------: | :------: | :------: | :------: |
|  =   | &#10004; | &#10004; | &#10004; | &#10004; |
|  !=  | &#10004; | &#10004; | &#10004; | &#10004; |
|  >   |    -     |    -     | &#10004; |    -     |
|  <   |    -     |    -     | &#10004; |    -     |
|  >=  |    -     |    -     | &#10004; |    -     |
|  <=  |    -     |    -     | &#10004; |    -     |
|  ^=  |    -     |    -     |    -     | &#10004; |
| \*=  |    -     |    -     |    -     | &#10004; |
|  $=  |    -     |    -     |    -     | &#10004; |
| !^=  |    -     |    -     |    -     | &#10004; |
| !\*= |    -     |    -     |    -     | &#10004; |
| !$=  |    -     |    -     |    -     | &#10004; |

### 关系选择器

用于连接两个属性选择器, 简单示例: `div > a`, 它表示两个节点之间的关系

关系选择器 由 关系操作符 和 关系表达式 构成

关系操作符 表示查找节点的方向, 有 5 种关系操作符, `+`, `-`, `>`, `<`, `<<`

关系表达式 有两种

- 元组表达式 `(a1,a2,a3,a_n)`, 其中 a1, a2, a3, a_n 是常量有序递增正整数, 示例 `(1)`, `(2,3,5)`
- 多项式表达式 `(an+b)`, 其中 a 和 b 是常量整数, 它是元组表达式的另一种表示, 这个元组的数字满足集合 `{an+b|an+b>=1,n>=1}` 如果集合为空集则表达式非法\
  当 a<=0 时, 它具有等价的元组表达式\
  示例 `(-n+4)` 等价于 `(1,2,3)`\
  示例 `(-3n+10)` 等价于 `(1,4,7)`\
  当 a>0 时, 它表示无限的元组表达式\
  示例 `(n)`, 它表示 `(1,2,3,...)` 一个无限的元组\
  示例 `(2n-1)`, 它表示 `(1,3,5,...)` 一个无限的元组

将 关系操作符 和 关系表达式 连接起来就得到了 关系选择器

`A +(a1,a2,a3,a_n) B` : A 是 B 的前置兄弟节点, 并且 A.index 满足 B.index-(a_m), 其中 a_m 是元组的任意一个数字

`A -(a1,a2,a3,a_n) B` : A 是 B 的后置兄弟节点, 并且 A.index 满足 B.index+(a_m)

`A >(a1,a2,a3,a_n) B` : A 是 B 的祖先节点, 并且 A.depth 满足 B.depth-(a_m), 根节点的 depth=0

`A <(a1,a2,a3,a_n) B` : A 是 B 的直接子节点, 并且 A.index 满足 a_m-1

`A <<(a1,a2,a3,a_n) B` : A 是 B 的子孙节点, 并且 A.order 满足 a_m-1, A.order 是深度优先先序遍历的索引 (搭配 quickFind 使用)

一些表达式的简写

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

如下是网页无障碍快照审查工具, 使用它的搜索框的选择器查询可以实时测试编写的选择器

```txt
https://i.gkd.li/import/12472597
https://i.gkd.li/import/12472598
https://i.gkd.li/import/12472599
https://i.gkd.li/import/12472605
https://i.gkd.li/import/12472606
https://i.gkd.li/import/12472607
https://i.gkd.li/import/12472608
https://i.gkd.li/import/12472610
https://i.gkd.li/import/12472611
https://i.gkd.li/import/12472612
https://i.gkd.li/import/12472613
https://i.gkd.li/import/12472615
https://i.gkd.li/import/12472616
https://i.gkd.li/import/12472617
https://i.gkd.li/import/12472619
https://i.gkd.li/import/12472620
https://i.gkd.li/import/12472621
https://i.gkd.li/import/12472623
https://i.gkd.li/import/12472625
https://i.gkd.li/import/12472627
https://i.gkd.li/import/12472628
https://i.gkd.li/import/12472629
https://i.gkd.li/import/12472630
https://i.gkd.li/import/12472631
https://i.gkd.li/import/12472632
https://i.gkd.li/import/12472633
https://i.gkd.li/import/12472634
https://i.gkd.li/import/12472635
https://i.gkd.li/import/12472636
https://i.gkd.li/import/12472637
```
