@echo off
set JAVA_HOME=C:\Users\ahmet\OneDrive\Belgeler\Local\web_editor_proje\oracleJdk-26
set PATH=%JAVA_HOME%\bin;%PATH%
cd backend
call mvnw.cmd -DskipTests spring-boot:run
