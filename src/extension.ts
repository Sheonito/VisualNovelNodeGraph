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

      // HTML 파일 경로
      const htmlPath = path.join(context.extensionPath, 'dist/index.html');
      let html = fs.readFileSync(htmlPath, 'utf8');

      // 🔹 Webview 전용 URI로 변환
      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'main.js'))
      );
      const styleUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'main.css'))
      );

      // 🔹 CSP 보안 정책 추가
      const csp = `
        <meta http-equiv="Content-Security-Policy" content="
          default-src 'none';
          style-src ${panel.webview.cspSource};
          script-src ${panel.webview.cspSource};
        ">`;

      // 🔹 HTML 수정: 경로와 CSP 삽입
      html = html
        .replace('./main.js', scriptUri.toString())
        .replace('</head>', `${csp}\n<link rel="stylesheet" href="${styleUri}">\n</head>`);

      // Webview에 HTML 설정
      panel.webview.html = html;
    })
  );
}

export function deactivate() {}
