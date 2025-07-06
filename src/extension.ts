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
        { enableScripts: true }
      );

      const htmlPath = path.join(context.extensionPath, 'dist/index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      panel.webview.html = html;
    })
  );
}

exports.activate = activate;