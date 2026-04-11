$user = [Environment]::GetEnvironmentVariable('Path','User')
$sdk = 'C:\Users\Global Computers\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin'
if ($user -notlike "*$sdk*") {
  $new = $user + ";$sdk"
  [Environment]::SetEnvironmentVariable('Path', $new, 'User')
  Write-Output 'UPDATED'
} else {
  Write-Output 'ALREADY_PRESENT'
}
