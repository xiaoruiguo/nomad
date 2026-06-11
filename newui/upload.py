import paramiko
import os

local = r'd:\claude\nomad\newui\nomad-dist.zip'
remote = '/tmp/nomad-dist.zip'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('127.0.0.1', port=2203, username='vagrant', password='vagrant')

sftp = ssh.open_sftp()
sftp.put(local, remote)
sftp.close()
ssh.close()

print(f'Uploaded {os.path.getsize(local)} bytes')
