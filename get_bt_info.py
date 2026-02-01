import paramiko
import re

hostname = '154.12.99.54'
username = 'root'
password = 'DElPHIws2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, username=username, password=password)
    
    # Run command to get panel info
    stdin, stdout, stderr = client.exec_command('bt default')
    output = stdout.read().decode('utf-8')
    print("Command Output:")
    print(output)
    
    client.close()
except Exception as e:
    print(f"Error: {e}")
