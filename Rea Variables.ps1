[Environment]::SetEnvironmentVariable("GHIDRA_INSTALL_DIR", "C:\Users\Dev\Documents\Ghidra", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-25.0.4", "User")
[Environment]::SetEnvironmentVariable("REA_ANALYSIS_PROVIDER", "ghidra", "User")
Write-Host ""
Write-Host "[SUCCESS] Variaveis de ambiente configuradas com sucesso!" -ForegroundColor Green