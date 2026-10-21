Set-Location "d:\New folder (3)"
npx astro dev --host --port 4321 2>&1 | Out-File -Append "d:\New folder (3)\server.log"