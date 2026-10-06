# Downloads the sample photos generated for the preview site into public\images.
# The links expire on 12 October 2026, so run this soon. Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File scripts\get-sample-images.ps1

$dest = Join-Path $PSScriptRoot "..\public\images"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$images = @{
  "hero-wedding"      = "https://www.figma.com/api/mcp/asset/13c48da2-82a7-4886-842a-ea774d86daf4.png"
  "dunz-portrait"     = "https://www.figma.com/api/mcp/asset/8656a478-e26a-43f7-818c-a36510305571.png"
  "rooftop-birthday"  = "https://www.figma.com/api/mcp/asset/2032cc58-84ab-4fd6-9f1c-ef5a530048a5.png"
  "studio-launch"     = "https://www.figma.com/api/mcp/asset/0363ea13-ecea-41ed-b5e5-47df423799d9.png"
  "braider"           = "https://www.figma.com/api/mcp/asset/332821b0-db1e-42a0-804c-88f8f87da630.png"
  "fashion-bts"       = "https://www.figma.com/api/mcp/asset/46b70fbe-ea12-4a31-b815-8513c873711d.png"
  "farmers-market"    = "https://www.figma.com/api/mcp/asset/2de13b2c-a189-485e-b7ab-20e800b0a1b4.png"
  "anniversary"       = "https://www.figma.com/api/mcp/asset/121e45f9-ede0-4324-86d4-a68250e2fe16.png"
  "booth-setup"       = "https://www.figma.com/api/mcp/asset/715b1621-e586-4ee4-b20c-093f200fb566.png"
  "booth-prints"      = "https://www.figma.com/api/mcp/asset/088e7b7a-4d25-410e-92a4-75b5c051fc3d.png"
  "booth-wedding"     = "https://www.figma.com/api/mcp/asset/f9670711-de7b-4710-9c16-3bfbac6dff7a.png"
}

foreach ($name in $images.Keys) {
  $out = Join-Path $dest "$name.png"
  Write-Host "Downloading $name"
  Invoke-WebRequest -Uri $images[$name] -OutFile $out -UseBasicParsing
}
Write-Host "Done. $($images.Count) images saved to public\images"
