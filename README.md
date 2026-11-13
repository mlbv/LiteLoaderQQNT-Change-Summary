# Change Summary

[PhantomLoaderQQNT](https://github.com/mlbv/PhantomLoaderQQNT) 插件，用于修改发送图片、表情包和商城表情时的外显概要文本。

## 安装

安装 PhantomLoaderQQNT 后，从[本仓库的 Releases](https://github.com/mlbv/LiteLoaderQQNT-Change-Summary/releases) 下载插件压缩包，在加载器设置中导入，重启 QQ。

从源码安装时，将包含 `manifest.json` 和 `src` 的插件目录放到当前加载器配置目录的 `plugins/change_summary` 下，再通过 PhantomLoaderQQNT 启动器启动 QQ。

## 使用

打开插件设置，分别填写图片和表情包的外显文本。商城表情使用表情包的设置。

图片和表情包可以分别启用随机文本。开启后，插件向设置中的 API 地址请求 JSON，并读取指定键值作为外显文本；默认使用[一言 API](https://v1.hitokoto.cn/) 的 `hitokoto` 字段。请求和文本修改完成后，消息按原有顺序继续发送。

设置保存在插件目录的 `config.json` 中，修改后即时生效。

![设置界面](src/assests/markdown/instuction.png)

## 作者与许可

本项目基于 [WJZ_P 的 LiteLoaderQQNT-Change-Summary](https://github.com/WJZ-P/LiteLoaderQQNT-Change-Summary)。随机外显功能由 XiaozhiSans（小只杉斯）实现，感谢上游作者、贡献者和 [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) 项目。

采用 [EPL-2.0 许可证](LICENSE)。问题与建议请提交到[本仓库 Issues](https://github.com/mlbv/LiteLoaderQQNT-Change-Summary/issues)。
