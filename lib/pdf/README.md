# PDF 解析系統

提供統一介面支援多種 PDF 解析提供商。

## 支援的提供商

### 1. unpdf (內建)

- **成本**: 免費，內建
- **特性**: 基礎文字提取、圖片提取
- **要求**: 無
- **使用**: 直接上傳 PDF 檔案

### 2. MinerU (本地部署)

- **成本**: 免費（需要自己部署）
- **特性**:
  - 高階文字提取（保留 Markdown 佈局）
  - 表格識別
  - 公式提取（LaTeX）
  - 更好的 OCR 支援
  - 多種輸出格式（markdown, JSON, docx, html, latex）
- **要求**:
  - 部署 MinerU 服務（Docker 或原始碼）
  - 配置伺服器地址
- **優勢**: 資料隱私、無檔案大小限制

## 快速開始

### 部署 MinerU（可選）

```bash
# Docker 部署（推薦）
docker pull opendatalab/mineru:latest
docker run -d --name mineru -p 8080:8080 opendatalab/mineru:latest

# 驗證
curl http://localhost:8080/api/health
```

### API 使用

#### 使用 unpdf（檔案上傳）

```typescript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('providerId', 'unpdf');

const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.data: ParsedPdfContent
```

#### 使用 MinerU（本地服務）

```typescript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('providerId', 'mineru');
formData.append('baseUrl', 'http://localhost:8080');

const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.data: ParsedPdfContent with imageMapping
```

## 響應格式

```typescript
interface ParsedPdfContent {
  text: string; // 提取的文字（MinerU 為 Markdown）
  images: string[]; // Base64 圖片陣列

  // 擴充套件特性（MinerU）
  tables?: Array<{
    page: number;
    data: string[][];
    caption?: string;
  }>;

  formulas?: Array<{
    page: number;
    latex: string;
    position?: { x: number; y: number; width: number; height: number };
  }>;

  layout?: Array<{
    page: number;
    type: 'title' | 'text' | 'image' | 'table' | 'formula';
    content: string;
    position?: { x: number; y: number; width: number; height: number };
  }>;

  metadata?: {
    pageCount: number;
    parser: 'unpdf' | 'mineru';
    fileName?: string;
    fileSize?: number;
    processingTime?: number;

    // 用於內容生成流程（MinerU）
    imageMapping?: Record<string, string>; // img_1 -> base64 URL
    pdfImages?: Array<{
      id: string; // img_1, img_2, etc.
      src: string; // base64 data URL
      pageNumber: number; // PDF 頁碼
      description?: string; // 圖片描述
    }>;
  };
}
```

## 與內容生成整合

MinerU 解析器與內容生成流程無縫整合：

```typescript
// 1. 解析 PDF
const parseResult = await parsePDF(
  {
    providerId: 'mineru',
    baseUrl: 'http://localhost:8080',
  },
  buffer,
);

// 2. 提取資料
const pdfText = parseResult.text; // Markdown（含 img_1 引用）
const pdfImages = parseResult.metadata.pdfImages; // 圖片陣列
const imageMapping = parseResult.metadata.imageMapping; // 圖片對映

// 3. 生成場景大綱
await generateSceneOutlinesFromRequirements(
  requirements,
  pdfText, // Markdown 內容
  pdfImages, // 帶頁碼的圖片
  aiCall,
);

// 4. 生成場景（含圖片）
await buildSceneFromOutline(
  outline,
  aiCall,
  stageId,
  assignedImages, // 從 pdfImages 篩選
  imageMapping, // 用於解析 img_1 到實際 URL
);
```

## 圖片處理流程

MinerU 的圖片處理：

1. **提取**: PDF → MinerU → Markdown + 圖片
2. **轉換**: `![alt](images/img_1.png)` → `![alt](img_1)`
3. **對映**: 建立 `{ "img_1": "data:image/png;base64,..." }`
4. **生成**: AI 使用 `img_1` 引用生成幻燈片
5. **解析**: `resolveImageIds()` 替換為實際 URL
6. **渲染**: 幻燈片顯示圖片

## 配置

### 全域性設定

```typescript
import { useSettingsStore } from '@/lib/store/settings';

useSettingsStore.setState({
  pdfProviderId: 'mineru',
  pdfProvidersConfig: {
    mineru: {
      baseUrl: 'http://localhost:8080',
      apiKey: 'optional-if-needed',
    },
  },
});
```

### 請求級配置

```typescript
// 在 API 呼叫時覆蓋全域性設定
formData.append('providerId', 'mineru');
formData.append('baseUrl', 'http://your-server:8080');
formData.append('apiKey', 'optional');
```

## 新增新的提供商

### 1. 定義提供商

`lib/pdf/constants.ts`:

```typescript
export const PDF_PROVIDERS = {
  myProvider: {
    id: 'myProvider',
    name: 'My Provider',
    requiresApiKey: true,
    features: ['text', 'images'],
  },
};
```

### 2. 實現解析器

`lib/pdf/pdf-providers.ts`:

```typescript
async function parseWithMyProvider(
  config: PDFParserConfig,
  pdfBuffer: Buffer
): Promise<ParsedPdfContent> {
  // 實現解析邏輯
  return {
    text: '...',
    images: [...],
    metadata: {
      pageCount: 0,
      parser: 'myProvider',
    },
  };
}
```

### 3. 新增到路由

```typescript
switch (config.providerId) {
  case 'unpdf':
    result = await parseWithUnpdf(pdfBuffer);
    break;
  case 'mineru':
    result = await parseWithMinerU(config, pdfBuffer);
    break;
  case 'myProvider':
    result = await parseWithMyProvider(config, pdfBuffer);
    break;
}
```

## 除錯工具

訪問 http://localhost:3000/debug/pdf-parser 測試解析功能：

- 切換提供商（unpdf/MinerU）
- 上傳 PDF 檔案
- 配置伺服器地址
- 檢視解析結果
- 檢查圖片對映

## 常見問題

### Q: MinerU 服務無法連線？

**A**: 檢查：

```bash
# 服務狀態
docker ps | grep mineru

# 網路連通性
curl http://localhost:8080/api/health

# 日誌
docker logs mineru
```

### Q: 圖片不顯示？

**A**: 確保：

1. `imageMapping` 正確傳遞到 scene-stream API
2. 圖片 ID 格式正確（img_1, img_2）
3. Base64 編碼完整

### Q: 解析速度慢？

**A**: 最佳化：

```bash
# 增加 Docker 資源
docker run -d \
  --name mineru \
  -p 8080:8080 \
  --memory=4g \
  --cpus=2 \
  opendatalab/mineru:latest
```

### Q: unpdf vs MinerU 如何選擇？

**A**: 選擇建議：

| 場景               | 推薦   |
| ------------------ | ------ |
| 簡單 PDF（純文字） | unpdf  |
| 包含表格、公式     | MinerU |
| 需要保留佈局       | MinerU |
| 快速測試           | unpdf  |
| 生產環境           | MinerU |
| 無法部署服務       | unpdf  |

## 效能建議

### MinerU 併發處理

```typescript
const files = [file1, file2, file3];

const results = await Promise.all(
  files.map((file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('providerId', 'mineru');
    return fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    }).then((r) => r.json());
  }),
);
```

### 結果快取

```typescript
// 考慮快取解析結果
const cacheKey = `pdf_${fileHash}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

## 參考資源

- **MinerU GitHub**: https://github.com/opendatalab/MinerU
- **快速開始**: `/MINERU_QUICKSTART.md`
- **變更說明**: `/MINERU_LOCAL_DEPLOYMENT.md`
- **除錯工具**: http://localhost:3000/debug/pdf-parser

---

**最後更新**: 2026-02-11
**模式**: 本地自託管
**狀態**: 生產就緒
