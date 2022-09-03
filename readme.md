# RedLang v0.0.4 pre 语法简述
注意，目前项目正在快速迭代，所有规则都有可能会改变，并且不会有任何通知，如果有自己的想法或者需求，可以一起讨论:<br />
作者qq：1875159423<br />
qq群号：920220179 (目前使用MiraiCQ的群)

[TOC]

## 目标
一个简单但强大的文本生成规则，由各种命令组成，<strong>将会</strong>支持读写文件，网络访问等一切和文本处理相关的事情。

## 代码一览
生成五个hello：
```
【循环@5@hello】
```
输出：
```
hellohellohellohellohello
```
当然，也可以很复杂，如：
```
【赋值变量@n@20】
递归计算斐波那契数列第【变量@n】项：
【定义变量@斐波那契数列函数@
    【函数定义@
        【判断@【计算@【参数@1】==1】@假@1【返回】】
        【判断@【计算@【参数@1】==2】@假@1【返回】】
        【计算@
            【函数调用@【变量@斐波那契数列函数】@【计算@【参数@1】-1】】
                            +
            【函数调用@【变量@斐波那契数列函数】@【计算@【参数@1】-2】】
        】
    】
】
【函数调用@【变量@斐波那契数列函数】@【变量@n】】
```
输出：
```
递归计算斐波那契数列第20项：6765
```

## 支持数据类型
文本、对象、数组、字节集、函数。文本是唯一可见(可输出)的数据类型。RedLang不直接支持数值、布尔、空等类型，主要原因是数值、布尔都是可见的，容易与文本混淆，而空类型容易与空文本混淆。

### 文本
正确的文本为UTF8格式的字符串。

### 对象
即键值对的组合，在有些编程语言中也叫做字典或者map。

### 数组
多个元素按次序组合的结构称为数组。

### 函数
函数被视作一种普通的类型，可以储存在变量中。函数本身也可以在定义时按值捕获外部变量(通过"闭包"指令)，如其它编程语言中的lambda一样。

### 字节集
二进制串

## 作用域规则
只有函数调用会产生新的作用域，如果没有被函数包裹，则位于全局作用域。

## 转义规则
只有<strong>字符串字面量</strong>需要转义，转义符号为<font color="red">\\</font>。<br />需要转义的字符有 <font color="red">@</font>、<font color="red">【</font>、<font color="red">】</font>、<font color="red">\\</font>。<br />另外，空格和换行的字面量会被忽略，需要使用命令【空格】、【换行】代替。特别说明的是，空格也可以用<font color="red">\\</font>来转义。

## 命令格式
【命令名@参数1@参数2@....】<br />
命令由命令名和参数组成，中间由@分割。<br />
特殊说明：如果命令名后紧接着下一个命令，那么之间的@可以省略<br />
如【命令名@【命令名...】...】可以等效为【命令名【命令名...】...】

## 通用命令说明

### 换行
【换行】<br />用来代替字面量的\\n

### 空格
【空格】<br />用来代替字面量的空格

### 隐藏
【隐藏@<font color="red">要隐藏的内容</font>】<br />
用来隐藏命令输出，被隐藏的输出，可以通过【传递】命令在之后取出。

### 传递
【传递】<br />
用来取出被上个"隐藏"命令隐藏的输出。

### 定义变量
【定义变量@<font color="red">变量名</font>@<font color="red">变量值</font>】<br />
用来在当前作用域定义变量，若当前作用域已经存在，则替换。

### 变量
【变量@<font color="red">变量名</font>】<br />
用来使用距离当前作用域最近的变量。

### 赋值变量
【赋值变量@<font color="red">变量名</font>@<font color="red">变量值</font>】<br />
用来修改距离当前作用域最近的变量，若搜索完所有作用域都无此变量，则在当前定义域定义此变量。

### 判断
【判断@<font color="red">文本1</font>@<font color="red">文本2</font>@<font color="red">不同执行</font>@<font color="red">相同执行</font>】<br />
其中<font color="red">相同执行</font>可以省略。

### 循环
【循环@<font color="red">循环次数</font>@<font color="red">循环语句</font>】

### 判循
【判循@<font color="red">循环条件</font>@<font color="red">循环语句</font>】<br />
循环条件为<font color="red">真</font>，则循环。

### 判空
【判空@<font color="red">被判断文本</font>@<font color="red">为空替换</font>】<br />
如果<font color="red">被判断文本</font>为空文本，则此变量表示的值为<font color="red">为空替换</font>，否则为<font color="red">被判断文本</font>

### 跳出
【跳出】<br />
用来跳出当前循环，注意必须在循环体中使用，等效于其它语言中的break语句。

### 继续
【继续】<br />用来继续下次循环，注意必须在循环体中使用，等效于其它语言中的continue语句。

### 函数定义
【函数定义@<font color="red">函数体</font>】<br />
用来定义一个函数，可以将其存入变量中。

### 函数调用
【函数调用@<font color="red">函数内容</font>@<font color="red">参数1</font>@<font color="red">参数2</font>@......】<br />
用来调用一个函数，函数内容通常是存在某个变量中的；参数个数没有限制，也可以没有参数；函数调用是形成新作用域的唯一办法。

### 参数
【参数@<font color="red">第几个参数</font>】<br />
参数个数从1开始数，如【参数@1】代表第一个参数，此命令只能在函数中使用。

### 返回
【返回】<br />
用于返回函数，在函数之外也<strong>可以</strong>使用。

### 计算
【计算@<font color="red">表达式</font>】<br />
用于数值计算和逻辑计算。<br />
支持的数值运算符：<br />
\+ - * / %(取余数) //(整除)<br />
支持的逻辑运算符： <br />
\==(等于) !=(不等于) > >= < <=<br />
逻辑运算表达式返回<font color="red">真</font>或<font color="red">假</font>。

### 数组
【数组@<font color="red">元素1</font>@<font color="red">元素2</font>@......】<br />
用来构建一个数组，可以为空数组：【数组】

### 对象
【对象@<font color="red">key1</font>@<font color="red">value1</font>@<font color="red">key2</font>@<font color="red">value2</font>@......】<br />
用来构建一个对象，可以为空对象：【对象】

### 取长度
【取长度@<font color="red">内容</font>】<br />
对于数组，返回元素个数；对于对象，返回key的个数；对于文本，返回utf8字符个数；暂时不支持字节集。

### 转文本
【转文本@<font color="red">内容</font>@<font color="red">字节集的编码</font>】<br />
当<font color="red">内容</font>为字节集时，将转化为对应编码的文本。<br />
当内容为对象、数组、文本时，将转化为对应的json格式文本。<br />
<font color="red">字节集的编码</font>支持UTF8、GBK，也可以省略，默认UTF8。

### 增加元素
【增加元素@<font color="red">变量名</font>@<font color="red">元素</font>】<br />
变量支持对象，文本，数组。<br />
若为对象，则需写成：<br />
【增加元素@<font color="red">变量名</font>@<font color="red">key</font>@<font color="red">value</font>】

### 取元素
【取元素@<font color="red">内容</font>@<font color="red">下标</font>@<font color="red">下标</font>@......】<br />
内容支持对象，文本，数组。<br />
为对象时，下标为key<br />
为数组时，下标从0开始数<br />
为文本时，下标从0开始数，返回的是UTF8字符<br />
当下标不存在(或越界)时，返回空文本

### 取类型
【取类型@<font color="red">内容</font>】<br />
返回内容的类型：数组，文本，对象，字节集，函数

### 取随机数
【取随机数@<font color="red">X</font>@<font color="red">Y</font>】<br />
随机返回X、Y之间的整数，包括X、Y。<br />
X，Y都必须为非负整数，且Y<strong>不能小于</strong>X。
对于32位版本，X、Y最大支持32位二进制位，对于64位版本，X、Y最大支持64位二进制位。

### 闭包
【闭包@<font color="red">语句</font>】<br />
用于在函数定义的时候使用，闭包中的语句会在<strong>函数定义</strong>时执行，成为函数定义的一部分。

### 随机取
【随机取@<font color="red">数组</font>@<font color="red">为空替换</font>】<br />
随机返回数组中的一个元素，若数组为空则此变量的值为<font color="red">为空替换</font>

### 取中间
【取中间@<font color="red">文本内容</font>@<font color="red">文本开始</font>@<font color="red">文本结束</font>】<br />
返回一个数组。

### 访问
【访问@<font color="red">网址</font>】<br />
GET访问网页，返回字节集。

### POST访问
【POST访问@<font color="red">网址</font>@<font color="red">访问体</font>】<br />
POST访问网页，访问体必须是字节集或文本，返回字节集。

### 设置访问头
【设置访问头@<font color="red">key</font>@<font color="red">value</font>】<br />
例子：
```
【设置访问头@User-Agent@Mozilla/5.0\ (Windows\ NT\ 6.1;\ Win64;\ x64)\ AppleWebKit/537.36\ (KHTML,\ like\ Gecko)\ Chrome/89.0.4389.72\ Safari/537.36】
```
在使用<font color="red">访问</font>、<font color="red">POST访问</font>命令之前使用。

### 编码
【编码@<font color="red">要编码的内容</font>】<br />
对url进行编码，如：
```
https://image.baidu.com/search/index?tn=baiduimage&word=【编码@樱小路露娜】
```
### Json解析 
【Json解析@<font color="red">Json内容</font>】<br />
返回RedLang对应的对象。
<br />注意，json中的数值，将会转化成文本；json中的布尔型，将会转化成<font color="red">真</font>或<font color="red">假</font>；json中的null，将会转化成空文本。

### 读文件 
【读文件@<font color="red">文件路径</font>】<br />
返回文件内容(字节集)。

### 分割 
【分割@<font color="red">要分割的文本</font>@<font color="red">分割符号</font>】<br />
返回文本数组。

### 判含 
【判含@<font color="red">被判断文本</font>@<font color="red">被包含文本</font>@<font color="red">不包含返回</font>@<font color="red">包含返回</font>】<br />
【判含@<font color="red">被判断数组</font>@<font color="red">被包含文本</font>】<br />
此命令有两种结构。<br />
第一种用于判断一段文本中是否包含另一段文本。<br />
第二种用于从数组中找出包含某文本的元素集合，返回的是一个数组。<br />

### 正则
【正则@<font color="red">文本</font>@<font color="red">正则表达式</font>】<br />
返回正则匹配结果(一个二维数组)

### 定义常量
【定义常量@<font color="red">常量名</font>@<font color="red">常量内容</font>】<br />
定义一个常量，常量在所有脚本中可见

### 常量
【常量@<font color="red">常量名</font>】<br />
读取一个常量，若常量不存在，返回空文本

### 转字节集
【转字节集@<font color="red">文本</font>@<font color="red">字节集编码</font>】<br />
将文本转为字节集，<font color="red">字节集编码</font>支持UTF-8、GBK，可以省略，默认UTF-8<br />
注意，只有文本才能转字节集

### BASE64编码
【BASE64编码@<font color="red">字节集</font>】<br />
将字节集转为base64编码的文本<br />
注意，只有字节集才能进行BASE64编码

### BASE64解码
【BASE64解码@<font color="red">base64文本</font>】<br />
将base64编码的文本转为字节集<br />
注意，只有base64编码的文本才能进行BASE64解码

### 延时
【延时@<font color="red">毫秒数</font>】<br />
如【延时@<font color="red">1000</font>】表示延时1秒

### 序号
【序号】<br />
每次触发后,【序号】的值+1 ，从0开始（此变量只在同一脚本下递增），可用【序号@x】将【序号】的值改为x。

### 时间戳
【时间戳】<br />
返回10位unix时间戳

【13位时间戳】<br />
返回13位时间戳

### 时间戳转文本
【时间戳转文本@时间戳】<br />
参数为10位unix时间戳，返回本地时间的文本表示(年-月-日-时-分-秒)，如<font color="red">2022-09-01-13-55-56</font>

## QQ相关命令说明

### 发送者QQ
【发送者QQ】

### 当前群号
【当前群号】<br />
只能在群聊中使用

### 发送者昵称
【发送者昵称】

### 机器人QQ
【机器人QQ】

### 机器人名字
【机器人名字】<br />
现在返回<font color="red">露娜sama</font>，暂时还不能自定义。

### 发送者权限
【发送者权限】<br />
只能在群聊中使用，返回<font color="red">群主</font>、<font color="red">管理</font>、<font color="red">群员</font>

### 发送者名片
【发送者名片】<br />
只能在群聊中使用

### 发送者专属头衔
【发送者专属头衔】<br />
只能在群聊中使用

### 消息ID
【消息ID】

### 撤回
【撤回@<font color="red">消息ID</font>】

### 输出流
【输出流@<font color="red">内容</font>】<br />
发送一条消息，然后返回消息ID

### 艾特
【艾特】<br />
at发送者，如果要at其它人，可以这么写：【艾特@<font color="red">其它人的ID</font>】

### CQ码解析
【CQ码解析@<font color="red">CQ码文本</font>】<br />
返回一个RedLang对象。类似这样:<font color="red">{"type":"at","qq":"1875159423"}</font>

### CQ反转义
【CQ反转义@<font color="red">内容</font>】<br />
返回反转义后的文本。

### CQ码转义
【CQ码转义@<font color="red">内容</font>】<br />
CQ码<strong>内部</strong>中的字符需要CQ码转义

### CQ转义
【CQ转义@<font color="red">内容</font>】<br />
CQ码<strong>外部</strong>的字符需要CQ转义，以上三个命令的作用可以参考：[onebot字符格式消息转义规则](https://github.com/botuniverse/onebot-11/blob/master/message/string.md#%E8%BD%AC%E4%B9%89)

### 子关键词
【子关键词】<br />
<font color="red">模糊匹配</font>和<font color="red">完全匹配</font>没有子关键词<br />
<font color="red">前缀匹配</font>的子关键词是关键词中的非前缀部分<br />
<font color="red">正则匹配</font>的子关键词是一个二维数组，表示各个捕获

### 事件内容
【事件内容】<br />
onebot事件json对应的RedLang对象。

### OB调用
【OB调用@<font color="red">self_id</font>@<font color="red">onebot要求的json文本</font>】<br />
此命令用于发送原始onebot数据，以调用框架不支持，以及尚未支持的功能。<br />
此命令返回api调用返回的RedLang对象。

## 事件关键词
如果触发类型为<font color="red">事件触发</font>，那么关键词应该为<font color="red">事件关键词</font>。<br />
事件关键词由事件类型组成:<br />
如戳一戳事件的关键词为<font color="red">notice:notify:poke</font><br />
群消息撤回事件的关键词为<font color="red">notice:group_recall</font><br />
支持的事件关键词可以参考[onebot文档](https://github.com/botuniverse/onebot-11)中有关事件的描述。

## 框架初始化事件
如果触发类型是<font color="red">框架初始化</font>，那么，脚本内容会在框架启动的时候执行一次。<br />
此时可能还未连接onebot实现端，不一定能正常调用bot的各个接口。一般用于定义一些常量。
