# 设计

## 插件模型

### 资源

红色问答的插件在磁盘上以文件夹形式存在，一个文件夹就是一个插件，一个插件拥有如下资源：

* 名字：对于非`默认插件`，文件夹的名字就是插件名。插件作者不能决定,甚至不能获取自己的插件名，插件名由最终使用者决定，可随意修改，这么做，就可以绝对保证插件不会重名，因为文件系统不支持。
* 磁盘资源：每个插件可以通过【应用目录】命令，来获得属于自己的磁盘路径，插件应该永远以这个路径为基础来进行文件目录操作。插件不应该记录这个路径，因为这个路径可能变化，比如插件改名的时候。
* 网络资源：每个插件可以拥有自己的网络路径，格式是`http://host:port/user/插件名/自定义路径`。其中，只有`自定义路径`是由插件作者定义的。
* 常量和自定义命令：每个插件拥有自己独立的常量和命令空间，在整个红色问答重启前，定义的常量和命令都是有效的。
* 持久常量：持久常量属于`磁盘资源`，在【应用目录】下的`reddat.db`文件中。
* 脚本文件：脚本文件依然属于`磁盘资源`。和传统软件不同，红色问答不区分代码目录和数据目录，这么做是为了简化概念。

### 生命周期

每个插件拥有独立的生命周期。

* 插件加载：在红色问答启动，或者插件重载的时候，会从【应用目录】中读取scripts.json文件，这个文件包含若干脚本。然后，其中触发类型为`框架初始化`的脚本会先被执行一次。
* 插件运行：在完成插件加载后，其它类型的脚本会由各种事件触发执行。
* 插件卸载：让当前插件不再收到新事件，等待当前插件所有脚本执行完毕。注意，红色问答没有名为类似`框架卸载`的触发方式，这么设计依然是为了简化概念，红色问答只是一个`词库系统`。
* 插件重载：先执行插件卸载，再执行插件加载。

你绝对不能编写一个长时间运行的脚本，否则会影响插件卸载和插件重载。即使你什么也没做，插件也可能自己卸载和重载以释放一些资源。

为了阻止复杂的问题发生，不建议在运行时修改插件的名字。

### 依赖管理

红色问答不进行依赖管理。具体来说就是，任意两个插件之间都感觉不到对方的存在，也不会存在相互依赖关系。红色问答提供了很多常用命令，并且也提供了运行python和安装python包的命令，还提供了lua解析器，大多数情况下你不依赖其它插件也可以完成插件编写。如果你的插件特别复杂，有大量的依赖关系，那么你不应该使用红色问答来编写。因为不进行依赖管理，所以，版本管理也没有太大意义，插件商店里的插件版本号，只是为了让你觉得插件作者还活着，但是唯一100%正确的更新插件的方法是关闭红色问答，然后删除旧插件文件夹，放入新插件文件夹。如果你想保留数据，你需要向插件作者确认数据在不同版本之间的兼容性。

### 默认插件

红色问答始终存在一个默认插件，用于在线调试等。它的【应用目录】在一个你很容易找到的地方，它的名字是一个空字符串，你可以认为它没有名字，反正前面说了，你获取不到插件的名字。这么做是为了简化概念，很多场景下，你只需要这么一个默认插件就行了，你可以忽略`插件`的概念，红色问答不是一个插件框架，而是一个词库系统，本身定位为插件。

## 适配器模型

适配器模型也可以叫做平台协议模型。

适配器用于连接真实的聊天平台，作用是触发事件、制造脚本运行环境。红色问答里面的平台相关的命令，会根据脚本运行环境来选择调用某适配器的的API。脚本的返回值也会根据脚本运行环境来选择返回给适配器的数据。简单来说，就是`适配器产生的事件决定脚本运行环境`，`脚本运行环境决定使用什么适配器的什么API`。另外，脚本运行环境也可以由脚本自己修改，以达到其它目的，比如清空`群ID`，就可以对群聊消息进行私聊回复、比如修改群`ID`，就可以让消息回复到其它群。

所有适配器都会支持一种类似onebot但不是onebot的统一的api和event格式，以保证大多数命令的通用性。这个格式目前是非公开的,之后会考虑公开。

红色问答编写平台协议的基本要求是：协议是某知名IM的官方协议、协议可以适配众多知名IM


## 用户体验

这里的用户指的是脚本开发者，红色问答是`全代码开发平台`，对比[低代码开发平台](https://baike.baidu.com/item/%E4%BD%8E%E4%BB%A3%E7%A0%81%E5%BC%80%E5%8F%91%E5%B9%B3%E5%8F%B0/23661682)。

红色问答要求用户具备编程基础：熟悉循环、判断、函数调用、数据类型等编程知识；具备数据库、网络、图像处理、操作系统等知识。

红色问答旨在简化开发方式，而不是降低开发门槛。简化的开发方式必然不能应对复杂的开发需求，但是总得有个倾向吧。我就想躺床上用一根指头在手机上指指点点就完成我的涩图插件。

红色问答运行在各种操作系统，各种架构上面，并且大多数功能不会损失。红色问答没有安装过程，本体只有一个可执行文件，双击即可获得大多数功能。你可以在box86、box64上运行，可以在wine上运行，可以在新版windows上、新版linux，新版android系统上运行，运行方式都统一为启动一个可执行文件。

红色问答同时兼容linux和windows的路径写法。是的，这对路径名有所限制，会导致不能在某些路径下面运行，间接也会影响插件名，但是我认为这是值得的。路径没事用啥特殊符号呀，撑的。


## 隐私保护

红色问答进行绝对的隐私保护。

要进行隐私保护，首先要定义什么是隐私。然而不同人有不同的定义。银行卡密码，名字，性别，年龄，身高，体重，电脑型号，软件使用时间，操作系统，软件有多少人在使用，这些都可以被定义为隐私。

绝对的隐私保护，意味着红色问答不会连接我的服务器，也尽可能不连接其它人的服务器，您的一切信息都不会传递给我。红色问答代码全部开源，您可以在github上查看。

注意：使用红色问答的插件商店，会向github或github代理地址发送信息。使用【上传文件】命令，会向[catbox.meo](https://catbox.moe/)发送信息。


## 安全控制

红色问答不进行安全控制。红色问答不进行安全控制。红色问答不进行安全控制。所有密码，所有数据全部明文保存、明文传输，明文显示。网络服务完全不进行安全防护，一攻击就蓝屏给你看，然后把数据全部送出去。访问密码什么的都是骗人的，一打就穿。所以，任何情况下都不要在防火墙上公开红色问答所使用的端口号。一定不要用不信任的设备访问红色问答的端口号，因为包括密码在内的数据会直接明文放在浏览量的cookie里面。操作红色问答的时候，要注意观察周围环境。其它软件让你相信安全，红色问答让你相信不安全。


## 命令系统设计

红色问答的语法格式并没有什么令人惊艳的地方，甚至也不是特别方便，我也不是专业设计这个的，反正群友说什么设计我就怎么设计。不过，这也不是侧重点。

红色问答维护的是大量功能，以及一堆rust包的依赖关系。这是非常繁重的工作，每个rust包，以及它们的版本号都是精心挑选的。用较小的可执行文件体积，完成了大量功能。并行这些功能都能在几乎所有平台上正常运行。设计思路有点像python的蓄电池思想。红色问答开发的大部分时间，是在测试各个rust包之间的兼容性。

红色问答不具备垃圾回收机制，所以，长时间运行的脚本，可能会使用越来越多的内存空间，这也是上面提到的`你绝对不能编写一个长时间运行的脚本`的另一个原因。在脚本运行结束的时候，内存会释放。redlang不是一个中文编程语言(我仍然会这么宣传)，而是一文本生成规则。