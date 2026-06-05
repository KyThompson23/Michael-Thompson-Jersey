# 球衣照片存放说明 / Jersey Photo Guide

## 文件夹结构
每件球衣一个文件夹，放在 `public/images/jerseys/` 下：

```
public/images/jerseys/
├── 1-kobe-lakers/          # Kobe 湖人
│   ├── 1.jpg               # 正面整体照
│   ├── 2.jpg               # 背面整体照
│   ├── 3.jpg               # 细节图1 (刺绣/Logo)
│   ├── 4.jpg               # 细节图2 (下摆标)
│   └── 5.jpg               # 细节图3 (内侧洗标)
├── 2-curry-warriors/       # Curry 勇士
│   └── ...
├── 3-jordan-bulls/         # Jordan 公牛
│   └── ...
...
```

## 命名规则
- 编号 1~5，必须是 `.jpg` 格式
- 1.jpg = 正面 | 2.jpg = 背面 | 3/4/5.jpg = 细节图
- 图片建议 1:1 比例，1200×1200px 以上

## 添加新球衣的图片
1. 在 `public/images/jerseys/` 下新建文件夹，用球衣ID做文件夹名
2. 放入 1.jpg ~ 5.jpg
3. 在 Admin 后台填写对应的 folder name

## 没放照片怎么办？
页面会自动用带标签的占位图来显示，不会报错。
