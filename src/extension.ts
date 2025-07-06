import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vnGraph.showGraph', () => {
      const panel = vscode.window.createWebviewPanel(
        'vnGraph',
        '스토리 그래프',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'dist')),
          ],
        }
      );

      // HTML 원본 경로
      const htmlPath = path.join(context.extensionPath, 'dist/index.html');
      let html = fs.readFileSync(htmlPath, 'utf8');

      // 🔹 Webview에서 접근 가능한 URI로 변환
      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'main.js'))
      );
      const styleUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'main.css'))
      );

      // 🔹 main.js 경로 교체
      html = html.replace('./main.js', scriptUri.toString());

      // 🔹 main.css 링크 삽입
      html = html.replace(
        '</head>',
        `<link rel="stylesheet" href="${styleUri}"></head>`
      );

      // Webview에 HTML 출력
      panel.webview.html = html;
    })
  );
}