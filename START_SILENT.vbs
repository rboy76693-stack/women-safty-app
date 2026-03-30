Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & WScript.ScriptFullName & """\..\safeguard.js", 0, False
