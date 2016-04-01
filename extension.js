// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var _ = require('lodash');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "assignalign" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.assignAlign', function() {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        var lines = _.flatMap(editor.selections, function(s) {
            return _.range(s.start.line, s.end.line + 1).map(function(i) {
                return editor.document.lineAt(i);
            });
        });
        
        lines.sort(function(a,b) {
            return _.clamp(a.lineNumber - b.lineNumber, -1, 1);
        });
        
        lines = _.filter(lines, function findAssignment(l) {
           return _.some(['='], function hasAssignmentOperator(c) {
               var firstIndex = l.text.indexOf(c);
               return ~firstIndex ? firstIndex === l.text.lastIndexOf(c) : false;
           }); 
        });
        
        if(lines.length <= 1) {
            return;
        }
        
        var exp = /(\w+)\s*=/;
        var maxAssignmentIndex = -1;
        var newLines = _.map(lines, function(line) {
            return line.text.replace(exp, function(match, p1, offset, str) {
                var replacement = p1 + ' =';
                maxAssignmentIndex = Math.max(offset + replacement.length - 1, maxAssignmentIndex);
                return replacement;
            });
        });
        
        newLines = _.map(newLines, function(newLine) {
            var currentIndex = newLine.indexOf('=');
            var spaceRequired = maxAssignmentIndex - currentIndex;
            var offsetAssignment = ' '.repeat(spaceRequired) + '=';
            return newLine.replace('=', offsetAssignment);
        });
        
        editor.edit(function(edit) {
           _.forEach(lines, function(line, index) {
             edit.replace(line.range, newLines[index]);  
           });
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;