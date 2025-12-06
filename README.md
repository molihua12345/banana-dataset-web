# Dataset Editor

用于在线协作修改数据集的 Web 工具。

## 功能

- 左侧边栏：按数字升序排列的数据项列表（0-768）
- 中间区域：可缩放的图片展示，支持鼠标滚轮缩放和拖拽平移
- 右上面板：raw_data JSON 只读显示
- 右下面板：updated_data JSON 可编辑并保存
- 支持 Ctrl+S 快捷键保存

## 下载数据集并解压

```bash
cd banana-dataset-web

hf login --token <hf_YOUR_ACCESS_TOKEN>

hf download nanochart-dataset/nano_dataset dataset_web.zip --repo-type dataset --local-dir .

unzip dataset_web.zip
```


## 服务器部署

### 方式一：直接运行

```bash

cd banana-dataset-web
npm install

# 后台运行（使用 nohup）
nohup node server.js > app.log 2>&1 &

# 或使用 screen
screen -S dataset
node server.js
# Ctrl+A+D 退出 screen
```

## 端口

```
访问 http://localhost:3000
```


## 修改端口

编辑 `server.js` 中的 `PORT` 变量，或使用环境变量：

```bash
PORT=8080 node server.js
```
